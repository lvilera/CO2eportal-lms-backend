// services/enrollment.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  // CREATE - Enroll student in course
  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    // Check if enrollment already exists
    const existingEnrollment = await this.enrollmentModel.findOne({
      userId: new Types.ObjectId(createEnrollmentDto.userId),
      courseId: new Types.ObjectId(createEnrollmentDto.courseId),
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    const enrollment = new this.enrollmentModel({
      ...createEnrollmentDto,
      enrollmentDate: new Date(),
      lastAccessed: new Date(),
    });

    return enrollment.save();
  }

  // READ - Get all enrollments with pagination and filtering

  async findAll({
    page = 1,
    limit = 20,
    q,
  }: {
    page?: number;
    limit?: number;
    q?: string;
  }) {
    const filter: FilterQuery<EnrollmentDocument> = { deletedAt: null };
    if (q) filter.$text = { $search: q };

    const [items, total] = await Promise.all([
      this.enrollmentModel
        .find(filter)
        .populate('userId', 'name email')
        .populate('courseId', 'title description')
        .populate('currentModule', 'name')
        .populate('currentLesson', 'title')
        .sort({ enrollmentDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.enrollmentModel.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  // READ - Get single enrollment by ID
  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findById(id)
      .populate('userId', 'name email avatar')
      .populate('courseId', 'title description thumbnail')
      .populate('currentModule', 'name order')
      .populate('currentLesson', 'title duration')
      .exec();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  // READ - Get enrollment by user and course
  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findOne({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
      })
      .populate('userId', 'name email')
      .populate('courseId', 'title description')
      .populate('currentModule', 'name')
      .populate('currentLesson', 'title')
      .exec();

    if (!enrollment) {
      throw new NotFoundException(
        'Enrollment not found for this user and course',
      );
    }

    return enrollment;
  }

  // UPDATE - Update enrollment
  async update(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findByIdAndUpdate(
        id,
        {
          ...updateEnrollmentDto,
          lastAccessed: new Date(),
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  // UPDATE - Update progress
  async updateProgress(id: string, progress: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findByIdAndUpdate(
        id,
        {
          progress: Math.min(100, Math.max(0, progress)), // Ensure between 0-100
          lastAccessed: new Date(),
          ...(progress === 100
            ? { status: 'completed', completionDate: new Date() }
            : {}),
        },
        { new: true },
      )
      .exec();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  // UPDATE - Update current lesson/module
  async updateCurrentPosition(
    id: string,
    currentModule: string,
    currentLesson: string,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel
      .findByIdAndUpdate(
        id,
        {
          currentModule: new Types.ObjectId(currentModule),
          currentLesson: new Types.ObjectId(currentLesson),
          lastAccessed: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  // DELETE - Remove enrollment
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.enrollmentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return { message: 'Enrollment deleted successfully' };
  }

  // Get user's enrollments
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('courseId', 'title description thumbnail instructor duration')
      .sort({ lastAccessed: -1 })
      .exec();
  }

  // Get course enrollments
  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .populate('userId', 'name email avatar')
      .sort({ enrollmentDate: -1 })
      .exec();
  }

  // Get enrollment statistics
  async getEnrollmentStats(courseId?: string): Promise<any> {
    const matchStage: any = {};
    if (courseId) {
      matchStage.courseId = new Types.ObjectId(courseId);
    }

    const stats = await this.enrollmentModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' },
        },
      },
    ]);

    const total = await this.enrollmentModel.countDocuments(matchStage);

    return {
      total,
      byStatus: stats,
    };
  }
}
