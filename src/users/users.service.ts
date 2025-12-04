import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, Model, SortOrder } from 'mongoose';

import { MailerService } from '@nestjs-modules/mailer';
import { Types } from 'mongoose';
import { AssignCompanyDto } from './dto/assign-company.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  /** UTIL */
  private sanitize(user: UserDocument) {
    return {
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? null,
    };
  }

  private async ensureEmailUnique(email: string, ignoreId?: string) {
    const existing = await this.userModel.findOne({
      email: email.toLowerCase().trim(),
      ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    });
    if (existing) throw new BadRequestException('Email already in use');
  }

  /** AUTH helpers from your original service */
  async findByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password +refreshTokenHash')
      .exec();
  }

  async comparePassword(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }

  async setRefreshTokenHash(userId: string, refreshToken: string | null) {
    if (refreshToken === null) {
      await this.userModel
        .findByIdAndUpdate(userId, { $set: { refreshTokenHash: null } })
        .exec();
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.userModel
      .findByIdAndUpdate(userId, { $set: { refreshTokenHash: hash } })
      .exec();
  }

  /** SELF profile */
  async me(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    if (dto.email) {
      await this.ensureEmailUnique(dto.email, userId);
      dto.email = dto.email.toLowerCase().trim();
    }
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { $set: dto },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    const ok = await this.comparePassword(currentPassword, user.password);
    if (!ok) throw new BadRequestException('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Invalidate refresh token on password change
    await this.setRefreshTokenHash(userId, null);

    return { message: 'Password updated' };
  }

  /** ADMIN: Create */
  async adminCreate(dto: CreateUserDto) {
    await this.ensureEmailUnique(dto.email);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(dto.password, salt);

    const doc = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase().trim(),
      password: hash,
    });
    await doc.save();
    return this.sanitize(doc);
  }

  /** ADMIN: List with pagination/filter/sort */
  async list(query: QueryUserDto) {
    const {
      q,
      role,
      companyId,
      isActive,
      page = 1,
      limit = 10,
      sort = 'createdAt:desc',
    } = query;

    const filter: FilterQuery<UserDocument> = { deletedAt: null };
    if (role) filter.role = role;
    if (companyId) filter.companyId = new Types.ObjectId(companyId);

    if (typeof isActive === 'string') filter.isActive = isActive === 'true';

    if (q) {
      const re = new RegExp(q.trim(), 'i');
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
    }
    const [sortField, sortDir = 'desc'] = (sort || 'createdAt:desc').split(':');
    const order: SortOrder = sortDir.toLowerCase() === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const sortObj: Record<string, SortOrder> = { [sortField]: order };
    if (page == -1) {
      const [items, total] = await Promise.all([
        this.userModel
          .find(filter)

          .exec(),
        this.userModel.countDocuments(filter),
      ]);
      return items;
    } else {
      const [items, total] = await Promise.all([
        this.userModel
          .find(filter)
          .populate('companyId')
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.userModel.countDocuments(filter),
      ]);
      return {
        data: items.map((u) => ({
          id: u._id.toString(),
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          companyId: u.companyId,
        })),
        meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      };
    }
  }

  /** ADMIN: Get by id (sanitized) */
  async getByIdSanitized(id: string) {
    const user = await this.userModel.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  /** ADMIN: Update by id */
  async adminUpdate(id: string, dto: UpdateUserDto) {
    if (dto.email) {
      await this.ensureEmailUnique(dto.email, id);
      dto.email = dto.email.toLowerCase().trim();
    }
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: dto },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  /** ADMIN: Soft delete */
  async softDelete(id: string) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date(), isActive: false } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User soft-deleted', id: user.id };
  }

  /** ADMIN: Restore */
  async restore(id: string) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found or not deleted');
    return this.sanitize(user);
  }

  /** ADMIN: Toggle active */
  async toggleActive(id: string) {
    const user = await this.userModel.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return this.sanitize(user);
  }

  /** Legacy helpers you had (kept for compatibility) */
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: User['role'];
  }) {
    return this.adminCreate(data);
  }

  async findByEmail(email: string, withPassword = false) {
    const q = this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (withPassword) q.select('+password +refreshTokenHash');
    return q.exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return user;
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash });
  }

  async compareRefreshToken(provided: string, storedHash?: string | null) {
    if (!provided || !storedHash) return false;
    return bcrypt.compare(provided, storedHash);
  }

  async assignCompany(dto: AssignCompanyDto) {
    const email = dto.email.trim().toLowerCase();

    // 1) Try to find existing user
    let user = await this.userModel.findOne({ email }).exec();

    // 2) If not found → create new user and send credentials
    if (!user) {
      const plainPassword = 'CO2LMS';
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      user = new this.userModel({
        email,
        firstName: 'New',
        lastName: 'User',
        role: 'user',
        password: passwordHash,
        company: dto.companyId,
      });

      await user.save();

      // Send credential email
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Your new LMS account credentials',
        text: `Hello ${user.firstName},

        An account has been created for you on our LMS and linked to your company.

        Login details:
        Email: ${user.email}
        Password: ${plainPassword}

        For security, please log in and change your password as soon as possible.

        Best regards,
        LMS Support Team`,
      });

      await user.populate('companyId');
      return user;
    }

    // 3) If user exists → just assign/update company
    user.companyId = new Types.ObjectId(dto.companyId);
    await user.save();
    await user.populate('companyId');

    return user;
  }

  async unassignCompany(userId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { company: null }, { new: true })
      .exec();

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
