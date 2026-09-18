import type { DomainEvent } from '../../domain/domain-event';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

/**
 * 도메인/애플리케이션 계층이 의존하는 유일한 이벤트 발행 인터페이스 (ADR-001 제약 1).
 * 구현체: OutboxEventPublisher (outbox 테이블 기록 → relay 가 브로커로 발행).
 */
export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}
