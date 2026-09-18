import { DomainEvent } from '../../../../shared/domain/domain-event';

export type ConversationStartedPayload = {
  sessionId: string;
  userId: string;
  startedAt: string;
};

export class ConversationStartedEvent extends DomainEvent<ConversationStartedPayload> {
  static readonly type = 'tutoring.conversation.started';
  readonly eventType = ConversationStartedEvent.type;

  constructor(readonly payload: ConversationStartedPayload) {
    super();
  }
}
