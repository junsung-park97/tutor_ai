import { DomainEvent } from '../../../../shared/domain/domain-event';

export class BadgeAwardedEvent extends DomainEvent {
  static readonly type = 'gamification.badge.awarded';
  readonly eventType = BadgeAwardedEvent.type;

  constructor(
    readonly payload: {
      userId: string;
      badgeCode: string;
    },
  ) {
    super();
  }
}
