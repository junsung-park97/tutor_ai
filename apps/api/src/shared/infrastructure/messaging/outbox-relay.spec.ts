import type { PrismaService } from '../prisma/prisma.service';
import { BATCH_SIZE, MAX_PUBLISH_ATTEMPTS, OutboxRelay } from './outbox-relay';
import type { RabbitMqPublisher } from './rabbitmq.publisher';

const outboxRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'row-1',
  eventId: 'evt-1',
  eventType: 'test.happened',
  version: 1,
  payload: { value: 1 },
  occurredAt: new Date('2026-01-01T00:00:00Z'),
  publishedAt: null,
  failureCount: 0,
  ...overrides,
});

const createMocks = () => {
  const prisma = {
    outboxEvent: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const broker = { publish: jest.fn().mockResolvedValue(undefined) };
  const relay = new OutboxRelay(
    prisma as unknown as PrismaService,
    broker as unknown as RabbitMqPublisher,
  );
  return { prisma, broker, relay };
};

describe('OutboxRelay', () => {
  test('does not mark the row as published when broker publish rejects', async () => {
    // Arrange
    const { prisma, broker, relay } = createMocks();
    prisma.outboxEvent.findMany.mockResolvedValue([outboxRow()]);
    broker.publish.mockRejectedValue(new Error('broker down'));

    // Act
    await relay.relay();

    // Assert — publishedAt 은 절대 기록되지 않고, 실패 횟수만 갱신된다
    const updateArgs = prisma.outboxEvent.update.mock.calls.map(([args]) => args);
    expect(updateArgs.some((args) => 'publishedAt' in args.data)).toBe(false);
    expect(updateArgs).toContainEqual({ where: { id: 'row-1' }, data: { failureCount: 1 } });
  });

  test('stops processing subsequent rows in the batch after a publish failure', async () => {
    // Arrange
    const { prisma, broker, relay } = createMocks();
    prisma.outboxEvent.findMany.mockResolvedValue([
      outboxRow({ id: 'a', eventId: 'evt-a' }),
      outboxRow({ id: 'b', eventId: 'evt-b' }),
      outboxRow({ id: 'c', eventId: 'evt-c' }),
    ]);
    broker.publish.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('boom'));

    // Act
    await relay.relay();

    // Assert — a 성공, b 실패, c 는 시도조차 하지 않는다 (순서 보존)
    expect(broker.publish).toHaveBeenCalledTimes(2);
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'a' },
      data: { publishedAt: expect.any(Date) },
    });
    const updatedIds = prisma.outboxEvent.update.mock.calls.map(([args]) => args.where.id);
    expect(updatedIds).not.toContain('c');
  });

  test('fetches pending rows ordered by occurredAt, excluding dead-lettered rows', async () => {
    // Arrange
    const { prisma, relay } = createMocks();

    // Act
    await relay.relay();

    // Assert — poison 행(failureCount 한도 초과)은 조회에서 제외되어 뒤를 막지 않는다
    expect(prisma.outboxEvent.findMany).toHaveBeenCalledWith({
      where: { publishedAt: null, failureCount: { lt: MAX_PUBLISH_ATTEMPTS } },
      orderBy: { occurredAt: 'asc' },
      take: BATCH_SIZE,
    });
  });

  test('publishes an envelope with ISO occurredAt and all wire-contract fields', async () => {
    // Arrange
    const { prisma, broker, relay } = createMocks();
    prisma.outboxEvent.findMany.mockResolvedValue([outboxRow()]);

    // Act
    await relay.relay();

    // Assert
    expect(broker.publish).toHaveBeenCalledWith({
      eventId: 'evt-1',
      eventType: 'test.happened',
      occurredAt: '2026-01-01T00:00:00.000Z',
      version: 1,
      payload: { value: 1 },
    });
  });
});
