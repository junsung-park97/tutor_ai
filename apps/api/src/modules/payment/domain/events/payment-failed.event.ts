import { DomainEvent } from '../../../../shared/domain/domain-event';
import type { MembershipPlan } from '../../../../shared/domain/membership-plan';

export type PaymentFailedPayload = {
  paymentId: string;
  userId: string;
  plan: MembershipPlan;
  reason: string;
};

export class PaymentFailedEvent extends DomainEvent<PaymentFailedPayload> {
  static readonly type = 'payment.failed';
  readonly eventType = PaymentFailedEvent.type;

  constructor(readonly payload: PaymentFailedPayload) {
    super();
  }
}
