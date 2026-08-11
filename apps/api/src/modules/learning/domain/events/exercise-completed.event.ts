import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ExerciseCompletedEvent extends DomainEvent {
  static readonly type = 'learning.exercise.completed';
  readonly eventType = ExerciseCompletedEvent.type;

  constructor(
    readonly payload: {
      attemptId: string;
      userId: string;
      exerciseType: 'CLOZE' | 'READING' | 'VOCAB';
      isCorrect: boolean | null;
    },
  ) {
    super();
  }
}
