import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Course {
  _id: Types.ObjectId;

  @Prop({ required: true, index: 'text' })
  title: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true })
  slug: string;

  @Prop() subtitle?: string;
  @Prop() description?: string;
  @Prop() thumbnailUrl?: string;

  @Prop({ index: true }) category?: string;
  @Prop({ type: [String], index: true }) tags?: string[];

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  level: 'beginner' | 'intermediate' | 'advanced';

  @Prop({ default: 'en' }) language: string;
  @Prop({ default: 0 }) price: number;

  @Prop({ default: false, index: true }) isPublished: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  instructorId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Module' })
  moduleOrder: Types.ObjectId[];

  @Prop({ default: 0 }) enrollmentCount: number;
  @Prop({ default: 0 }) rating: number;
  @Prop({ default: 0 }) ratingCount: number;
  @Prop({ default: 0 }) durationMinutes: number;

  @Prop({ type: Date, default: null }) deletedAt: Date | null;
}

export type CourseDocument = HydratedDocument<Course>;
export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ title: 'text', tags: 'text' });
