import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateCourseLessonDto } from './dto/create-course-lesson.dto';
import { UpdateCourseLessonDto } from './dto/update-course-lesson.dto';
import {
  CourseLesson,
  CourseLessonDocument,
} from './schemas/course-lesson.schema';

@Injectable()
export class CourseLessonsService {
  constructor(
    @InjectModel(CourseLesson.name) private model: Model<CourseLessonDocument>,
  ) {}

  async create(dto: CreateCourseLessonDto) {
    return this.model.create(dto);
  }

  async findAll({
    page = 1,
    limit = 20,
    q,
  }: {
    page?: number;
    limit?: number;
    q?: string;
  }) {
    const filter: FilterQuery<CourseLessonDocument> = { deletedAt: null };
    if (q) filter.$text = { $search: q };

    // page = -1 → return all (no pagination, no skip)
    if (page === -1) {
      const [items, total] = await Promise.all([
        this.model
          .find(filter)
          .sort({ createdAt: -1 })
          .populate('courseId')
          .populate('moduleId'),
        this.model.countDocuments(filter),
      ]);
      return items;
    }

    const safePage = page < 1 ? 1 : page;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .skip((safePage - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('courseId')
        .populate('moduleId'),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page: safePage, limit };
  }

  async findOne(idOrSlug: string) {
    const filter: any = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const doc = await this.model.findOne({ ...filter, deletedAt: null });
    if (!doc) throw new NotFoundException('CourseLesson not found');
    return doc;
  }

  async update(id: string, dto: UpdateCourseLessonDto) {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      dto,
      { new: true },
    );
    if (!doc) throw new NotFoundException('CourseLesson not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('CourseLesson not found');
    return { success: true };
  }
}
