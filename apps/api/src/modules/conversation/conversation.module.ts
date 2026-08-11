import { Module } from '@nestjs/common';

/**
 * 대화 기록 바운디드 컨텍스트 (컨슈머 전용).
 * tutoring.* 이벤트를 구독해 세션·턴을 영속화하고 조회 API 를 제공한다.
 */
@Module({})
export class ConversationModule {}
