import { DomainEvent } from '../../../../shared/domain/domain-event';

export type UserTurnCompletedPayload = {
  sessionId: string;
  userId: string;
  seq: number;
  text: string;
  speakingSeconds: number;
};

export class UserTurnCompletedEvent extends DomainEvent<UserTurnCompletedPayload> {
  static readonly type = 'tutoring.turn.user-completed';
  readonly eventType = UserTurnCompletedEvent.type;

  constructor(readonly payload: UserTurnCompletedPayload) {
    super();
  }
}
