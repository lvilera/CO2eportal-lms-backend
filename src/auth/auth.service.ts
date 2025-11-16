import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/token-payload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const created = await this.users.create(payload);
    const tokens = await this.issueTokens(
      created._id.toString(),
      created.email,
      created.role,
    );
    await this.saveRefreshHash(created._id.toString(), tokens.refreshToken);
    return { user: this.safeUser(created), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email, true);
    console.log(user);

    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);

    if (!match) return new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.saveRefreshHash(user._id.toString(), tokens.refreshToken);
    return { user: this.safeUser(user), ...tokens };
  }

  async refresh(userFromGuard: JwtPayload & { refreshToken: string }) {
    const user = await this.users.findById(userFromGuard.sub);
    const withSecret = await this.users.findByEmail(user.email, true);

    if (!withSecret?.refreshTokenHash)
      throw new ForbiddenException('Not logged in');
    const valid = await bcrypt.compare(
      userFromGuard.refreshToken,
      withSecret.refreshTokenHash,
    );
    if (!valid) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.issueTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.saveRefreshHash(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.users.updateRefreshTokenHash(userId, null);
    return { success: true };
  }

  private async issueTokens(
    sub: string,
    email: string,
    role: string,
  ): Promise<Tokens> {
    const payload: JwtPayload = { sub, email, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.users.updateRefreshTokenHash(userId, hash);
  }

  private safeUser(u: any) {
    return {
      id: u._id?.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
