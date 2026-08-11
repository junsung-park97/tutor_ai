import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ConversationEndedEvent extends DomainEvent {
  static readonly type = 'tutoring.conversation.ended';
  readonly eventType = ConversationEndedEvent.type;

  constructor(
    readonly payload: {
      sessionId: string;
      userId: string;
      endedAt: string;
      turnCount: number;
      totalSpeakingSeconds: number;
    },
  ) {
    super();
  }
}
