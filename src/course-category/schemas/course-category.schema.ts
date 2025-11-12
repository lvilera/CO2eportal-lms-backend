import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CourseCategory {
  _id: Types.ObjectId;

  @Prop({ required: true, index: 'text' })
  title: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true })
  slug: string;

  @Prop() subtitle?: string;
  @Prop() description?: string;
  @Prop() thumbnailUrl?: string;

  @Prop({ default: true, index: true }) isPublished: boolean;

  @Prop({ type: Date, default: null }) deletedAt: Date | null;
}

export type CourseCategoryDocument = HydratedDocument<CourseCategory>;
export const CourseCategorySchema =
  SchemaFactory.createForClass(CourseCategory);

CourseCategorySchema.index({ title: 'text', tags: 'text' });
