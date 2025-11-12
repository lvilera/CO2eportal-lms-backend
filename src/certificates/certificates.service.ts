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

  create(dto: CreateCertificateDto) {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      courseId: new Types.ObjectId(dto.courseId),
      issuedAt: new Date(dto.issuedAt),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  listByUser(userId: string) {
    return this.model.find({ userId });
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Certificate not found');
    return { success: true };
  }
}
