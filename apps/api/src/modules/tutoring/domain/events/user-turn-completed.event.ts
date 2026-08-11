import { DomainEvent } from '../../../../shared/domain/domain-event';

export class UserTurnCompletedEvent extends DomainEvent {
  static readonly type = 'tutoring.turn.user-completed';
  readonly eventType = UserTurnCompletedEvent.type;

  constructor(
    readonly payload: {
      sessionId: string;
      userId: string;
      seq: number;
      text: string;
      speakingSeconds: number;
    },
  ) {
    super();
  }
}
