import { Module } from '@nestjs/common';

/**
 * 학습 분석 바운디드 컨텍스트 (컨슈머 전용).
 * 턴/세션/예제 이벤트를 구독해 DailyLearningStat read model 을 갱신한다 (projection).
 * 조회는 eventual consistency 를 허용한다.
 */
@Module({})
export class AnalyticsModule {}
