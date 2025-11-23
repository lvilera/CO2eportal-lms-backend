import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class InstructorAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if JWT is valid
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has instructor or admin role
    if (!['instructor', 'admin'].includes(user.role)) {
      throw new ForbiddenException('Instructor or Admin access required');
    }

    return true;
  }
}
