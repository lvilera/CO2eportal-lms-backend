import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Quiz {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ModuleEntity', index: true })
  moduleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', index: true })
  lessonId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop() instructions?: string;

  @Prop({ default: 0 })
  timeLimitSeconds?: number;

  @Prop({ default: 1 })
  attemptsAllowed: number;

  @Prop({ default: 70 })
  passMarkPercent: number;

  @Prop({ type: [Types.ObjectId], ref: 'Question' })
  questionOrder: Types.ObjectId[];
}
export type QuizDocument = HydratedDocument<Quiz>;
export const QuizSchema = SchemaFactory.createForClass(Quiz);
