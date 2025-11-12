import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Question {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId: Types.ObjectId;

  @Prop({
    enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer'],
    required: true,
  })
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';

  @Prop({ required: true })
  text: string;

  @Prop() explanation?: string;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        text: String,
        isCorrect: Boolean,
      },
    ],
  })
  options?: { _id: Types.ObjectId; text: string; isCorrect: boolean }[];

  @Prop() answerText?: string;

  @Prop({ default: 1 })
  points: number;

  @Prop({ default: 0, index: true })
  position: number;
}
export type QuestionDocument = HydratedDocument<Question>;
export const QuestionSchema = SchemaFactory.createForClass(Question);
