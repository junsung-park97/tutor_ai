import { DomainEvent } from '../../../../shared/domain/domain-event';

export type AiTurnCompletedPayload = {
  sessionId: string;
  userId: string;
  seq: number;
  text: string;
};

export class AiTurnCompletedEvent extends DomainEvent<AiTurnCompletedPayload> {
  static readonly type = 'tutoring.turn.ai-completed';
  readonly eventType = AiTurnCompletedEvent.type;

  constructor(readonly payload: AiTurnCompletedPayload) {
    super();
  }
}
