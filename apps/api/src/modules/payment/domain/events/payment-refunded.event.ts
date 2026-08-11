import { DomainEvent } from '../../../../shared/domain/domain-event';

/** Saga 보상 트랜잭션(mock 환불) 완료 시 발행 */
export class PaymentRefundedEvent extends DomainEvent {
  static readonly type = 'payment.refunded';
  readonly eventType = PaymentRefundedEvent.type;

  constructor(
    readonly payload: {
      paymentId: string;
      userId: string;
      reason: string;
    },
  ) {
    super();
  }
}
