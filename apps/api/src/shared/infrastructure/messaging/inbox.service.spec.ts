import { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { InboxService } from './inbox.service';

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

const createClientMock = () => ({
  processedEvent: { create: jest.fn().mockResolvedValue({}) },
});

describe('InboxService', () => {
  test('tryMarkProcessed claims the event with the eventId+consumer pair and returns true', async () => {
    // Arrange
    const prisma = createClientMock();
    const inbox = new InboxService(prisma as unknown as PrismaService);

    // Act
    const isFirstProcessing = await inbox.tryMarkProcessed('evt-1', 'conversation.events');

    // Assert
    expect(isFirstProcessing).toBe(true);
    expect(prisma.processedEvent.create).toHaveBeenCalledWith({
      data: { eventId: 'evt-1', consumer: 'conversation.events' },
    });
  });

  test('tryMarkProcessed returns false when the event was already processed (P2002)', async () => {
    // Arrange — 동시 배달 경쟁에서 진 쪽: 유니크 제약 위반은 "이미 처리됨" 신호다
    const prisma = createClientMock();
    prisma.processedEvent.create.mockRejectedValue(uniqueViolation());
    const inbox = new InboxService(prisma as unknown as PrismaService);

    // Act
    const isFirstProcessing = await inbox.tryMarkProcessed('evt-1', 'conversation.events');

    // Assert
    expect(isFirstProcessing).toBe(false);
  });

  test('tryMarkProcessed rethrows errors that are not unique-constraint violations', async () => {
    // Arrange
    const prisma = createClientMock();
    prisma.processedEvent.create.mockRejectedValue(new Error('connection lost'));
    const inbox = new InboxService(prisma as unknown as PrismaService);

    // Act & Assert
    await expect(inbox.tryMarkProcessed('evt-1', 'audit.events')).rejects.toThrow(
      'connection lost',
    );
  });

  test('tryMarkProcessed writes through the provided tx client when given', async () => {
    // Arrange
    const prisma = createClientMock();
    const tx = createClientMock();
    const inbox = new InboxService(prisma as unknown as PrismaService);

    // Act
    await inbox.tryMarkProcessed('evt-1', 'membership.events', tx as never);

    // Assert — 비즈니스 처리와 같은 트랜잭션으로 claim 되어야 롤백 시 함께 풀린다
    expect(tx.processedEvent.create).toHaveBeenCalledTimes(1);
    expect(prisma.processedEvent.create).not.toHaveBeenCalled();
  });
});
