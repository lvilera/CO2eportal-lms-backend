import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { GetUser } from 'src/common/decorators/get-user.decorator';

import { Roles } from 'src/common/dto/roles.decorator';
import { AssignCompanyDto } from './dto/assign-company.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface CurrentUserPayload {
  sub: string;
  email: string;
  role?: 'user' | 'admin' | 'instructor';
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   */
  @Get('me')
  @ApiOkResponse({ description: 'Returns the authenticated user profile.' })
  me(@GetUser() user: CurrentUserPayload) {
    return this.usersService.me(user.sub);
  }

  /**
   * PUT /users/me
   */
  @Patch('me')
  @ApiOkResponse({ description: 'Updates the authenticated user profile.' })
  updateMe(@GetUser() user: CurrentUserPayload, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.sub, dto);
  }

  /**
   * PATCH /users/me/change-password
   */
  @Patch('me/change-password')
  @ApiOkResponse({ description: 'Change password for the authenticated user.' })
  changeMyPassword(
    @GetUser() user: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  /**
   * ADMIN CRUD — guarded by @Roles('admin')
   */

  // Create user (admin)
  @Post()
  @Roles('admin')
  @ApiCreatedResponse({ description: 'Create a new user (admin only).' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.adminCreate(dto);
  }

  // List users with pagination/filter
  @Get()
  @Roles('admin')
  @ApiOkResponse({ description: 'List users with pagination and filters.' })
  async list(@Query() query: QueryUserDto) {
    return this.usersService.list(query);
  }

  @Post('company')
  @ApiOkResponse({ description: 'Update user by id.' })
  assignCompany(@Body() dto: AssignCompanyDto) {
    return this.usersService.assignCompany(dto);
  }

  @Delete(':id/company')
  unassignCompany(@Param('id') id: string) {
    return this.usersService.unassignCompany(id);
  }

  // Get one by id
  @Get(':id')
  @Roles('admin')
  @ApiOkResponse({ description: 'Get user by id.' })
  async getById(@Param('id') id: string) {
    return this.usersService.getByIdSanitized(id);
  }

  // Update by id
  @Patch(':id')
  @Roles('admin')
  @ApiOkResponse({ description: 'Update user by id.' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.adminUpdate(id, dto);
  }

  // Soft-delete by id
  @Delete(':id')
  @Roles('admin')
  @ApiOkResponse({ description: 'Soft delete user by id.' })
  async remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  // Optional: restore soft-deleted
  @Patch(':id/restore')
  @Roles('admin')
  @ApiOkResponse({ description: 'Restore a soft-deleted user.' })
  async restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  // Optional: deactivate/activate
  @Patch(':id/toggle-active')
  @Roles('admin')
  @ApiOkResponse({ description: 'Toggle active state of a user.' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
