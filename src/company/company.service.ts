import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    const created = new this.companyModel(dto);
    return created.save();
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel
      .find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'courses',
        populate: [
          {
            path: 'categoryId',
            model: 'CourseCategory',
          },
          {
            path: 'instructorId',
            model: 'User',
          },
        ],
      })
      .exec();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async remove(id: string): Promise<void> {
    const res = await this.companyModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Company not found');
    }
  }

  async assignCourse(companyId: string, courseId: string): Promise<Company> {
    const updated = await this.companyModel
      .findByIdAndUpdate(
        companyId,
        {
          $addToSet: { courses: new Types.ObjectId(courseId) }, // avoid duplicates
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Company with id "${companyId}" not found`);
    }

    return updated;
  }

  async unassignCourse(companyId: string, courseId: string): Promise<Company> {
    const updated = await this.companyModel
      .findByIdAndUpdate(
        companyId,
        {
          $pull: { courses: new Types.ObjectId(courseId) },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Company with id "${companyId}" not found`);
    }

    return updated;
  }

  async getCompanyCourses(companyId: string): Promise<any[]> {
    const company = await this.companyModel
      .findById(companyId)
      .populate({
        path: 'courses',
        populate: [
          {
            path: 'categoryId',
            model: 'CourseCategory',
          },
          {
            path: 'instructorId',
            model: 'User',
          },
        ],
      })
      .exec();

    if (!company) {
      throw new NotFoundException(`Company with id "${companyId}" not found`);
    }

    return company.courses as any[];
  }
}
