import { DomainEvent } from '../../../../shared/domain/domain-event';

/** 만료 시점 도달 시 발행 — 만료 스케줄링은 BullMQ delayed job 으로 처리 */
export class MembershipExpiredEvent extends DomainEvent {
  static readonly type = 'membership.expired';
  readonly eventType = MembershipExpiredEvent.type;

  constructor(
    readonly payload: {
      membershipId: string;
      userId: string;
      plan: 'BASIC' | 'PREMIUM';
    },
  ) {
    super();
  }
}
