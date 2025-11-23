import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizAttemptDocument = HydratedDocument<QuizAttempt>;

@Schema({ timestamps: true })
export class QuizAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  attemptNumber: number;

  @Prop({ required: true, default: Date.now })
  startedAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 0 })
  score: number; // Percentage

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  pointsEarned: number;

  @Prop({ default: 0 })
  timeSpent: number; // in seconds

  @Prop({
    enum: ['in_progress', 'completed', 'abandoned', 'time_up'],
    default: 'in_progress',
  })
  status: string;

  @Prop({
    type: [
      {
        questionId: { type: Types.ObjectId, ref: 'Question', required: true },
        selectedAnswers: [{ type: String }],
        answerText: { type: String },
        isCorrect: { type: Boolean },
        pointsEarned: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 }, // in seconds
      },
    ],
  })
  answers: Array<{
    questionId: Types.ObjectId;
    selectedAnswers: string[];
    answerText?: string;
    isCorrect?: boolean;
    pointsEarned: number;
    timeSpent: number;
  }>;

  @Prop()
  feedback?: string;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);

// Compound indexes
QuizAttemptSchema.index(
  { userId: 1, quizId: 1, attemptNumber: 1 },
  { unique: true },
);
QuizAttemptSchema.index({ userId: 1, courseId: 1 });
QuizAttemptSchema.index({ quizId: 1, status: 1 });
