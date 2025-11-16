import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import {
  CourseCategory,
  CourseCategoryDocument,
} from './schemas/course-category.schema';

@Injectable()
export class CourseCategoryService {
  constructor(
    @InjectModel(CourseCategory.name)
    private model: Model<CourseCategoryDocument>,
  ) {}

  async create(dto: CreateCourseCategoryDto) {
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
    const filter: FilterQuery<CourseCategoryDocument> = { deletedAt: null };
    if (q) filter.$text = { $search: q };

    if (page == -1) {
      const [items, total] = await Promise.all([
        this.model.find(filter).sort({ createdAt: -1 }),
        this.model.countDocuments(filter),
      ]);
      return items;
    } else {
      const [items, total] = await Promise.all([
        this.model
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
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
    if (!doc) throw new NotFoundException('Course not found');
    return doc;
  }

  async update(id: string, dto: UpdateCourseCategoryDto) {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      dto,
      { new: true },
    );
    if (!doc) throw new NotFoundException('Course not found');
    return doc;
  }

  async softDelete(id: string) {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    );
    if (!doc)
      throw new NotFoundException('Course not found or already deleted');
    return { success: true };
  }
}
