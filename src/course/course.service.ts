import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private model: Model<CourseDocument>) {}

  async create(dto: CreateCourseDto) {
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
    const filter: FilterQuery<CourseDocument> = { deletedAt: null };
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
          .sort({ createdAt: -1 })
          .populate('categoryId')
          .populate('instructorId'),
        this.model.countDocuments(filter),
      ]);
      return { items, total, page, limit };
    }
  }

  async findOne(idOrSlug: string) {
    const filter: any = Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };
    const doc = await this.model
      .findOne({ ...filter, deletedAt: null })
      .populate('categoryId')
      .populate('instructorId');
    if (!doc) throw new NotFoundException('Course not found');
    return doc;
  }

  async update(id: string, dto: UpdateCourseDto) {
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
