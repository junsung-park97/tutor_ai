import { DomainEvent } from '../../../../shared/domain/domain-event';

export class LevelAnalyzedEvent extends DomainEvent {
  static readonly type = 'tutoring.level.analyzed';
  readonly eventType = LevelAnalyzedEvent.type;

  constructor(
    readonly payload: {
      reportId: string;
      userId: string;
      sessionId: string;
      level: string;
      summary: string;
    },
  ) {
    super();
  }
}
