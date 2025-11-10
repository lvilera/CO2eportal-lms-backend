import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CourseLesson,
  CourseLessonDocument,
} from './schemas/course-lesson.schema';

@Injectable()
export class CourseLessonsService {
  constructor(
    @InjectModel(CourseLesson.name) private model: Model<CourseLessonDocument>,
  ) {}

  create(courseId: string, moduleId: string, dto: any) {
    return this.model.create({
      ...dto,
      courseId: new Types.ObjectId(courseId),
      moduleId: new Types.ObjectId(moduleId),
    });
  }

  async findByModule(moduleId: string) {
    return this.model.find({ moduleId }).sort({ position: 1 });
  }

  async findOne(idOrSlug: string) {
    const filter = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const doc = await this.model.findOne(filter);
    if (!doc) throw new NotFoundException('Lesson not found');
    return doc;
  }

  async update(id: string, dto: any) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!doc) throw new NotFoundException('Lesson not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Lesson not found');
    return { success: true };
  }
}
