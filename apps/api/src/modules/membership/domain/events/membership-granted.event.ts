import { DomainEvent } from '../../../../shared/domain/domain-event';
import type { MembershipPlan } from '../../../../shared/domain/membership-plan';

export type MembershipGrantedPayload = {
  membershipId: string;
  userId: string;
  plan: MembershipPlan;
  expiresAt: string | null;
};

export class MembershipGrantedEvent extends DomainEvent<MembershipGrantedPayload> {
  static readonly type = 'membership.granted';
  readonly eventType = MembershipGrantedEvent.type;

  constructor(readonly payload: MembershipGrantedPayload) {
    super();
  }
}
