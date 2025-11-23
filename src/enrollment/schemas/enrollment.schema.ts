// schemas/enrollment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  enrollmentDate: Date;

  @Prop({
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active',
  })
  status: string;

  @Prop({ default: null })
  completionDate: Date;

  @Prop({ min: 0, max: 100, default: 0 })
  progress: number;

  @Prop({ default: Date.now })
  lastAccessed: Date;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', default: null })
  currentModule: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseLesson', default: null })
  currentLesson: Types.ObjectId;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Create compound index
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
