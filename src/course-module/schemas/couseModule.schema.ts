import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CourseModuleEntity {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Lesson' })
  lessonOrder: Types.ObjectId[];

  @Prop({ default: 0, index: true })
  position: number;
}
export type CourseModuleDocument = HydratedDocument<CourseModuleEntity>;
export const CourseModuleSchema =
  SchemaFactory.createForClass(CourseModuleEntity);
