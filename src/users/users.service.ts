import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { UpdateMeDto } from './dto/update-me.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: User['role'];
  }) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);
    const user = new this.userModel({ ...data, password: hash });
    await user.save();
    // return lean object without password
    const { password, ...rest } = user.toObject();
    return rest;
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password +refreshTokenHash')
      .exec();
  }

  async findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email });
    if (withPassword) query.select('+password +refreshTokenHash');
    return query.exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash });
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

  async comparePassword(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }

  async compareRefreshToken(
    provided: string,
    storedHash: string | null | undefined,
  ) {
    if (!provided || !storedHash) return false;
    return bcrypt.compare(provided, storedHash);
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException();
    return this.sanitize(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .exec();
    if (!user) throw new NotFoundException();
    return this.sanitize(user);
  }

  private sanitize(user: UserDocument) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
