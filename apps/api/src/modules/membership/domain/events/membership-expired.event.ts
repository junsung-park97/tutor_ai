import { DomainEvent } from '../../../../shared/domain/domain-event';
import type { MembershipPlan } from '../../../../shared/domain/membership-plan';

export type MembershipExpiredPayload = {
  membershipId: string;
  userId: string;
  plan: MembershipPlan;
};

/** 만료 시점 도달 시 발행 — 만료 스케줄링은 BullMQ delayed job 으로 처리 */
export class MembershipExpiredEvent extends DomainEvent<MembershipExpiredPayload> {
  static readonly type = 'membership.expired';
  readonly eventType = MembershipExpiredEvent.type;

  constructor(readonly payload: MembershipExpiredPayload) {
    super();
  }
}
