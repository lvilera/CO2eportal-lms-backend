import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CourseLesson {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ModuleEntity',
    required: true,
    index: true,
  })
  moduleId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true })
  slug: string;

  @Prop() content?: string;

  @Prop({ type: Object })
  video?: {
    url?: string;
    durationSeconds?: number;
    transcript?: string;
  };

  @Prop({ type: [{ title: String, url: String }] })
  resources?: { title: string; url: string }[];

  @Prop({ default: false })
  isPreview: boolean;

  @Prop({ default: 0, index: true })
  position: number;
}
export type CourseLessonDocument = HydratedDocument<CourseLesson>;
export const CourseLessonSchema = SchemaFactory.createForClass(CourseLesson);
