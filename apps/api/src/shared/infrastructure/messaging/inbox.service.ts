import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 컨슈머 멱등성 (inbox 패턴, ADR-001 제약 3).
 * 모든 컨슈머는 처리 전 isProcessed 로 중복을 확인하고, 처리 후 markProcessed 를 호출한다.
 */
@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  async isProcessed(eventId: string, consumer: string): Promise<boolean> {
    const found = await this.prisma.processedEvent.findUnique({
      where: { eventId_consumer: { eventId, consumer } },
    });
    return found !== null;
  }

  async markProcessed(eventId: string, consumer: string): Promise<void> {
    await this.prisma.processedEvent.create({ data: { eventId, consumer } });
  }
}
