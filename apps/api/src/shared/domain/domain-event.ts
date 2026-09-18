import { randomUUID } from 'node:crypto';
import type { JsonObject } from './json-value';

/**
 * 모든 도메인 이벤트의 베이스.
 *
 * ADR-001 제약: eventType 은 곧 브로커 라우팅 키다 (`<context>.<subject>.<action>`).
 * 브로커 고유 개념(헤더, exchange 등)은 이 계층에 노출되지 않는다.
 */
export abstract class DomainEvent<TPayload extends JsonObject = JsonObject> {
  // 이벤트의 이름. 이것이 RabbitMQ 라우팅 키
  abstract readonly eventType: string;
  // 도메인별 실제 데이터 — JSON 직렬화 가능한 값만 허용 (Date 등은 컴파일 에러)
  abstract readonly payload: TPayload;

  // RabbitMQ는 at-least-once임. 그래서 최소 한번 이상을 보장.
  // eventId == 멱등성key의 핵심, 컨슈머가 이 id를 보고 중복을 걸러냄
  readonly eventId: string = randomUUID();
  // 이벤트 발생 시각. OutboxRelay가 이 순서로 발행함
  // 컨슈머가 occurredAt으로 시간에 대한 문제를 해결함
  readonly occurredAt: Date = new Date();
  readonly version: number = 1;
}
