import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Certificate {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  certificateNumber: string;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ default: Date })
  expiresAt?: Date;

  @Prop()
  verifiableUrl?: string;

  @Prop({ type: Object })
  metadata?: {
    gradePercent?: number;
    instructorName?: string;
    templateId?: string;
  };
}
export type CertificateDocument = HydratedDocument<Certificate>;
export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
