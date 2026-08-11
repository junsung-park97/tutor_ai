import { DomainEvent } from '../../../../shared/domain/domain-event';

export class PaymentFailedEvent extends DomainEvent {
  static readonly type = 'payment.failed';
  readonly eventType = PaymentFailedEvent.type;

  constructor(
    readonly payload: {
      paymentId: string;
      userId: string;
      plan: 'BASIC' | 'PREMIUM';
      reason: string;
    },
  ) {
    super();
  }
}
