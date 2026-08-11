import { Module } from '@nestjs/common';

/**
 * 알림 바운디드 컨텍스트 (컨슈머 전용).
 * 여러 도메인 이벤트를 구독해 인앱 알림을 생성한다. 생성 작업은 BullMQ 잡으로 처리.
 * 실제 푸시/이메일 발송은 제외 범위.
 */
@Module({})
export class NotificationModule {}
