import { Module } from '@nestjs/common';

/**
 * 게이미피케이션 바운디드 컨텍스트 (컨슈머 + 발행자).
 * 스트릭·뱃지를 소유하며, 학습/튜터링 이벤트를 구독해 갱신하고
 * 뱃지 부여 시 BadgeAwardedEvent 를 발행한다.
 */
@Module({})
export class GamificationModule {}
