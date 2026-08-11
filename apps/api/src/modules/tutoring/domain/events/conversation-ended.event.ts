import { DomainEvent } from '../../../../shared/domain/domain-event';

export type ConversationEndedPayload = {
  sessionId: string;
  userId: string;
  endedAt: string;
  turnCount: number;
  totalSpeakingSeconds: number;
};

export class ConversationEndedEvent extends DomainEvent<ConversationEndedPayload> {
  static readonly type = 'tutoring.conversation.ended';
  readonly eventType = ConversationEndedEvent.type;

  constructor(readonly payload: ConversationEndedPayload) {
    super();
  }
}
