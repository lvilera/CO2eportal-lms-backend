import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import {
  CourseModule,
  CourseModuleDocument,
} from './schemas/couseModule.schema';

@Injectable()
export class CourseModuleService {
  constructor(
    @InjectModel(CourseModule.name)
    private model: Model<CourseModuleDocument>,
  ) {}

  async create(dto: CreateCourseModuleDto) {
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
    const filter: FilterQuery<CourseModuleDocument> = { deletedAt: null };
    if (q) filter.$text = { $search: q };

    // Special case: page = -1 → return all items (no pagination, no skip)
    if (page === -1) {
      const [items, total] = await Promise.all([
        this.model.find(filter).sort({ createdAt: -1 }).populate('courseId'),
        this.model.countDocuments(filter),
      ]);
      // Follow the pattern you used in CourseCategoryService
      return items;
    }

    // Safety: ensure page is at least 1 to avoid negative skip
    const safePage = page < 1 ? 1 : page;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .skip((safePage - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('courseId'),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page: safePage, limit };
  }

  async findOne(idOrSlug: string) {
    const filter: any = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const doc = await this.model.findOne({ ...filter, deletedAt: null });
    if (!doc) throw new NotFoundException('CourseModule not found');
    return doc;
  }

  async update(id: string, dto: UpdateCourseModuleDto) {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      dto,
      { new: true },
    );
    if (!doc) throw new NotFoundException('CourseModule not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('CourseModule not found');
    return { success: true };
  }
}
