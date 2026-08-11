import { Module } from '@nestjs/common';

/**
 * AI 튜터링 바운디드 컨텍스트.
 *
 * 실시간 핫패스(WS → VAD → STT → LLM 스트리밍 → TTS)를 소유한다.
 * 핫패스는 이벤트 인프라를 통과하지 않으며(ADR-001), 도메인 이벤트를
 * fire-and-forget 으로 outbox 에 기록만 한다.
 * 레벨 측정(프리미엄)은 BullMQ 잡으로 처리하고 완료 시 LevelAnalyzedEvent 를 발행한다.
 */
@Module({})
export class TutoringModule {}
