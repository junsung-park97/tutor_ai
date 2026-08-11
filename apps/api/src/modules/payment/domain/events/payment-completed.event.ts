import { DomainEvent } from '../../../../shared/domain/domain-event';

export class PaymentCompletedEvent extends DomainEvent {
  static readonly type = 'payment.completed';
  readonly eventType = PaymentCompletedEvent.type;

  constructor(
    readonly payload: {
      paymentId: string;
      userId: string;
      plan: 'BASIC' | 'PREMIUM';
      amountKrw: number;
      pgTransactionId: string;
    },
  ) {
    super();
  }
}
