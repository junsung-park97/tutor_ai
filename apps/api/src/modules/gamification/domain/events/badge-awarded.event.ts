import { DomainEvent } from '../../../../shared/domain/domain-event';

export type BadgeAwardedPayload = {
  userId: string;
  badgeCode: string;
};

export class BadgeAwardedEvent extends DomainEvent<BadgeAwardedPayload> {
  static readonly type = 'gamification.badge.awarded';
  readonly eventType = BadgeAwardedEvent.type;

  constructor(readonly payload: BadgeAwardedPayload) {
    super();
  }
}
