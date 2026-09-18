import { DomainEvent } from '../../../../shared/domain/domain-event';
import type { MembershipPlan } from '../../../../shared/domain/membership-plan';

export type PaymentCompletedPayload = {
  paymentId: string;
  userId: string;
  plan: MembershipPlan;
  amountKrw: number;
  pgTransactionId: string;
};

export class PaymentCompletedEvent extends DomainEvent<PaymentCompletedPayload> {
  static readonly type = 'payment.completed';
  readonly eventType = PaymentCompletedEvent.type;

  constructor(readonly payload: PaymentCompletedPayload) {
    super();
  }
}
