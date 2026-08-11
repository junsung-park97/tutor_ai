import { DomainEvent } from '../../../../shared/domain/domain-event';

export class AiTurnCompletedEvent extends DomainEvent {
  static readonly type = 'tutoring.turn.ai-completed';
  readonly eventType = AiTurnCompletedEvent.type;

  constructor(
    readonly payload: {
      sessionId: string;
      userId: string;
      seq: number;
      text: string;
    },
  ) {
    super();
  }
}
