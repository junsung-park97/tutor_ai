import { DomainEvent } from '../../domain/domain-event';
import type { PrismaService } from '../prisma/prisma.service';
import { OutboxEventPublisher } from './outbox-event-publisher';

class TestEvent extends DomainEvent {
  readonly eventType = 'test.happened';

  constructor(readonly payload: { value: number }) {
    super();
  }
}

const createOutboxClientMock = () => ({
  outboxEvent: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
});

describe('OutboxEventPublisher', () => {
  test('publishAllInTx writes through the provided tx client, not the injected PrismaService', async () => {
    // Arrange
    const prisma = createOutboxClientMock();
    const tx = createOutboxClientMock();
    const publisher = new OutboxEventPublisher(prisma as unknown as PrismaService);
    const event = new TestEvent({ value: 1 });

    // Act
    await publisher.publishAllInTx(tx as never, [event]);

    // Assert — outbox 원자성의 핵심: 반드시 호출자의 트랜잭션으로 기록되어야 한다
    expect(tx.outboxEvent.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.outboxEvent.createMany).not.toHaveBeenCalled();
  });

  test('publishAll maps every DomainEvent field to the outbox row shape', async () => {
    // Arrange
    const prisma = createOutboxClientMock();
    const publisher = new OutboxEventPublisher(prisma as unknown as PrismaService);
    const event = new TestEvent({ value: 42 });

    // Act
    await publisher.publishAll([event]);

    // Assert
    expect(prisma.outboxEvent.createMany).toHaveBeenCalledWith({
      data: [
        {
          eventId: event.eventId,
          eventType: 'test.happened',
          version: 1,
          payload: { value: 42 },
          occurredAt: event.occurredAt,
        },
      ],
    });
  });

  test('publishAll is a no-op for an empty array', async () => {
    // Arrange
    const prisma = createOutboxClientMock();
    const publisher = new OutboxEventPublisher(prisma as unknown as PrismaService);

    // Act
    await publisher.publishAll([]);

    // Assert
    expect(prisma.outboxEvent.createMany).not.toHaveBeenCalled();
  });
});
