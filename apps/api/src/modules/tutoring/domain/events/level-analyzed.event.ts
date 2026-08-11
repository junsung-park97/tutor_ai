import { DomainEvent } from '../../../../shared/domain/domain-event';

export type LevelAnalyzedPayload = {
  reportId: string;
  userId: string;
  sessionId: string;
  level: string;
  summary: string;
};

export class LevelAnalyzedEvent extends DomainEvent<LevelAnalyzedPayload> {
  static readonly type = 'tutoring.level.analyzed';
  readonly eventType = LevelAnalyzedEvent.type;

  constructor(readonly payload: LevelAnalyzedPayload) {
    super();
  }
}
