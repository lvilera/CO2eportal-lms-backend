import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { Certificate, CertificateDocument } from './schemas/certificate.schema';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name) private model: Model<CertificateDocument>,
  ) {}

  async create(dto: CreateCertificateDto) {
    const existing = await this.model
      .findOne({
        userId: new Types.ObjectId(dto.userId),
        courseId: new Types.ObjectId(dto.courseId),
      })
      .populate('userId')
      .populate('courseId');

    if (existing) {
      return existing;
    }

    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      courseId: new Types.ObjectId(dto.courseId),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  listByUser(userId: string) {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .populate('userId')
      .populate('courseId');
  }

  findOne(id: string) {
    return this.model.findById(id).populate('userId').populate('courseId');
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Certificate not found');
    return { success: true };
  }
}
