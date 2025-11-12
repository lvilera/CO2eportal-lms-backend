import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

interface CurrentUserPayload {
  sub: string; // user id
  email: string;
  role?: 'user' | 'admin' | 'instructor';
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   */
  @Get('me')
  @ApiOkResponse({
    description: 'Returns the authenticated user profile.',
    schema: {
      example: {
        id: '665a3a8d0b1f1a2b3c4d5e6f',
        email: 'jane@acme.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        createdAt: '2025-01-01T12:00:00.000Z',
        updatedAt: '2025-01-03T12:00:00.000Z',
      },
    },
  })
  me(@GetUser() user: CurrentUserPayload) {
    return this.usersService.me(user.sub);
  }

  /**
   * Put /users/me
   */
  @Put('me')
  @ApiOkResponse({
    description: 'Updates the authenticated user profile.',
    schema: {
      example: {
        id: '665a3a8d0b1f1a2b3c4d5e6f',
        email: 'jane@acme.com',
        firstName: 'Janet',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        createdAt: '2025-01-01T12:00:00.000Z',
        updatedAt: '2025-01-03T12:10:00.000Z',
      },
    },
  })
  updateMe(@GetUser() user: CurrentUserPayload, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.sub, dto);
  }
}
