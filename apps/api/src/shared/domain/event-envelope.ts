/**
 * 브로커 중립 이벤트 봉투 (ADR-001 제약 2).
 * RabbitMQ → Redis Streams 로 백본을 교체해도 이 직렬화 형태는 유지된다.
 */
export interface EventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  version: number;
  payload: T;
}
