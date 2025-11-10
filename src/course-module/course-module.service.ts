import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CourseModuleDocument,
  CourseModuleEntity,
} from './schemas/couseModule.schema';

@Injectable()
export class CourseModuleService {
  constructor(
    @InjectModel(CourseModuleEntity.name)
    private model: Model<CourseModuleDocument>,
  ) {}

  create(courseId: string, dto: any) {
    return this.model.create({
      ...dto,
      courseId: new Types.ObjectId(courseId),
    });
  }

  async findByCourse(courseId: string) {
    return this.model.find({ courseId });
  }

  async update(id: string, dto: any) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!doc) throw new NotFoundException('Module not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Module not found');
    return { success: true };
  }
}
