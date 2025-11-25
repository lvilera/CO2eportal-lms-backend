import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CourseDocument } from 'src/course/schemas/course.schema';
import { CourseLessonQueryDto } from './dto/course-lesson-query.dto';
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
    courseId,
    moduleId,
  }: CourseLessonQueryDto) {
    const filter: FilterQuery<CourseDocument> = { deletedAt: null };

    if (q) {
      filter.$text = { $search: q };
    }

    if (courseId) {
      filter.courseId = new Types.ObjectId(courseId);
    }

    if (moduleId) {
      filter.moduleId = new Types.ObjectId(moduleId);
    }
    if (limit == -1) {
      console.log(filter);

      const items = await this.model.find(filter);

      return items;
    } else {
      const [items, total] = await Promise.all([
        this.model
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('courseId')
          .populate('moduleId'),
        this.model.countDocuments(filter),
      ]);

      return { items, total, page, limit };
    }
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
