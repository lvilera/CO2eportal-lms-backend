import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', index: true })
  moduleId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  instructions?: string;

  @Prop({ default: 0 })
  timeLimitSeconds?: number;

  @Prop({ default: 1 })
  attemptsAllowed: number;

  @Prop({ default: 70 })
  passMarkPercent: number;

  @Prop({ default: 0 })
  order: number;

  @Prop({
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop()
  availableFrom?: Date;

  @Prop()
  availableUntil?: Date;

  @Prop({ default: false })
  shuffleQuestions: boolean;

  @Prop({ default: false })
  shuffleOptions: boolean;

  @Prop({ default: 0 })
  totalPoints: number;
}

export type QuizDocument = HydratedDocument<Quiz>;
export const QuizSchema = SchemaFactory.createForClass(Quiz);
