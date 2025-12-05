import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CourseDocument } from 'src/course/schemas/course.schema';
import { Quiz, QuizDocument } from 'src/quizzes/schemas/quiz.schema';
import { CourseContentItemDto } from './dto/course-content-item.dto';
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
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  private generateSlugSuffix(length = 6): string {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }

  async create(dto: CreateCourseLessonDto) {
    const baseSlug = dto.slug;
    let slug = baseSlug;

    // Try a few times to guarantee uniqueness
    for (let i = 0; i < 5; i++) {
      const exists = await this.model.exists({ slug });

      if (!exists) {
        // We found a free slug
        return this.model.create({ ...dto, slug });
      }

      // Slug taken -> append random string
      slug = `${baseSlug}-${this.generateSlugSuffix()}`;
    }

    // Final attempt – let Mongo enforce uniqueness
    return this.model.create({ ...dto, slug });
  }

  async findAll({
    page = 1,
    limit = 20,
    q,
    courseId,
    moduleId,
  }: CourseLessonQueryDto) {
    const filter: FilterQuery<CourseDocument> = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    if (moduleId) {
      filter.moduleId = moduleId;
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

  async findAllWithQuiz({
    q,
    courseId,
    moduleId,
  }: CourseLessonQueryDto): Promise<{ items: CourseContentItemDto[] }> {
    const filter: FilterQuery<any> = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    if (moduleId) {
      filter.moduleId = moduleId;
    }
    // Run in parallel and use lean for performance
    const [lessons, quizzes] = await Promise.all([
      this.model
        .find(filter)
        .populate('courseId')
        .populate('moduleId')
        .lean()
        .exec(),
      this.quizModel
        .find(filter)
        .populate('courseId')
        .populate('moduleId')
        .lean()
        .exec(),
    ]);

    const lessonItems: CourseContentItemDto[] = lessons.map((l: any) => ({
      ...l,
      id: l._id.toString(),
      title: l.title,
      createdAt: l.createdAt,
      type: 'lesson',
    }));

    const quizItems: CourseContentItemDto[] = quizzes.map((qz: any) => ({
      ...qz,
      id: qz._id.toString(),
      title: qz.title,
      createdAt: qz.createdAt,
      type: 'quiz',
    }));

    const merged = [...lessonItems, ...quizItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { items: merged };
  }

  async findOne(idOrSlug: string) {
    const filter: any = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const doc = await this.model.findOne({ ...filter });
    if (!doc) throw new NotFoundException('CourseLesson not found');
    return doc;
  }

  async update(id: string, dto: UpdateCourseLessonDto) {
    const doc = await this.model.findOneAndUpdate(dto, { new: true });
    if (!doc) throw new NotFoundException('CourseLesson not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('CourseLesson not found');
    return { success: true };
  }
}
