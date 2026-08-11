import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ConversationStartedEvent extends DomainEvent {
  static readonly type = 'tutoring.conversation.started';
  readonly eventType = ConversationStartedEvent.type;

  constructor(
    readonly payload: {
      sessionId: string;
      userId: string;
      startedAt: string;
    },
  ) {
    super();
  }
}
