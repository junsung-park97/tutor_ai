import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { EventPublisherPort } from '../../application/ports/event-publisher.port';
import type { DomainEvent } from '../../domain/domain-event';
// DI 주입 클래스는 값 임포트여야 한다 — import type 은 design:paramtypes 메타데이터를 지운다
import { PrismaService } from '../prisma/prisma.service';

const toOutboxRow = (event: DomainEvent) => ({
  eventId: event.eventId,
  eventType: event.eventType,
  version: event.version,
  // DomainEvent 의 TPayload extends JsonObject 제약이 JSON 안전성을 컴파일 타임에 보장한다
  payload: event.payload as Prisma.InputJsonValue,
  occurredAt: event.occurredAt,
});

/**
 * EventPublisherPort 의 Transactional Outbox 구현체.
 * 브로커에 직접 쓰지 않고 outbox 테이블에 기록하며, 발행은 OutboxRelay 가 담당한다.
 */
@Injectable()
export class OutboxEventPublisher implements EventPublisherPort {
  constructor(private readonly prisma: PrismaService) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.publishAll([event]);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;
    await this.prisma.outboxEvent.createMany({ data: events.map(toOutboxRow) });
  }

  /**
   * 비즈니스 데이터와 같은 트랜잭션 안에서 이벤트를 기록해야 할 때 사용
   * (예: 결제 승인 + PaymentCompleted 기록 — "DB 커밋됐는데 이벤트 유실" 방지).
   */
  async publishAllInTx(tx: Prisma.TransactionClient, events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;
    await tx.outboxEvent.createMany({ data: events.map(toOutboxRow) });
  }
}
