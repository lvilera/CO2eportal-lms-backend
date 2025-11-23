import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if JWT is valid
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has admin role
    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
