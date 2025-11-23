import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class QuestionOption {
  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Boolean, default: false })
  isCorrect: boolean;

  @Prop({ type: String })
  explanation?: string;
}

export const QuestionOptionSchema =
  SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId: Types.ObjectId;

  @Prop({
    enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer'],
    required: true,
  })
  type: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  explanation?: string;

  @Prop({ type: [QuestionOptionSchema] })
  options?: QuestionOption[];

  @Prop()
  answerText?: string;

  @Prop({ default: 1, min: 0 })
  points: number;

  @Prop({ default: 0, index: true })
  position: number;

  @Prop({ default: 0 })
  timeLimitSeconds?: number;

  @Prop({
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty: string;
}

export type QuestionDocument = HydratedDocument<Question>;
export const QuestionSchema = SchemaFactory.createForClass(Question);

// Index for better query performance
QuestionSchema.index({ quizId: 1, position: 1 });
