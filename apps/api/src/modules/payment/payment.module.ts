import { Module } from '@nestjs/common';

/**
 * 결제 바운디드 컨텍스트.
 *
 * mock PG 는 결제 결과를 비동기 웹훅으로 통지한다 (중복·순서 역전 가정 → inbox 멱등 처리).
 * 프리미엄 구매 Saga: PaymentCompleted → 멤버십 부여 → 환영 알림, 실패 시 mock 환불 보상.
 * PG 연동은 PaymentGatewayPort 뒤에 숨긴다 (mock 어댑터).
 */
@Module({})
export class PaymentModule {}
