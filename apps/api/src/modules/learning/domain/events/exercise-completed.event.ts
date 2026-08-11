import { DomainEvent } from '../../../../shared/domain/domain-event';

export type ExerciseCompletedPayload = {
  attemptId: string;
  userId: string;
  exerciseType: 'CLOZE' | 'READING' | 'VOCAB';
  isCorrect: boolean | null;
};

export class ExerciseCompletedEvent extends DomainEvent<ExerciseCompletedPayload> {
  static readonly type = 'learning.exercise.completed';
  readonly eventType = ExerciseCompletedEvent.type;

  constructor(readonly payload: ExerciseCompletedPayload) {
    super();
  }
}
