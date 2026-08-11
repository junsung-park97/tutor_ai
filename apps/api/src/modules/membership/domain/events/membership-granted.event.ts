import { DomainEvent } from '../../../../shared/domain/domain-event';

export class MembershipGrantedEvent extends DomainEvent {
  static readonly type = 'membership.granted';
  readonly eventType = MembershipGrantedEvent.type;

  constructor(
    readonly payload: {
      membershipId: string;
      userId: string;
      plan: 'BASIC' | 'PREMIUM';
      expiresAt: string | null;
    },
  ) {
    super();
  }
}
