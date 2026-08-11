import { randomUUID } from 'node:crypto';

/**
 * 모든 도메인 이벤트의 베이스.
 *
 * ADR-001 제약: eventType 은 곧 브로커 라우팅 키다 (`<context>.<subject>.<action>`).
 * 브로커 고유 개념(헤더, exchange 등)은 이 계층에 노출되지 않는다.
 */
export abstract class DomainEvent {
  abstract readonly eventType: string;
  abstract readonly payload: Record<string, unknown>;

  readonly eventId: string = randomUUID();
  readonly occurredAt: Date = new Date();
  readonly version: number = 1;
}
