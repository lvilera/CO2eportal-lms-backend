import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseModuleService } from './course-module.service';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';

@ApiTags('Modules')
@ApiBearerAuth()
@Controller('courses/:courseId/modules')
export class CourseModuleController {
  constructor(private readonly service: CourseModuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create module under a course' })
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseModuleDto,
  ) {
    return this.service.create(courseId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List modules for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.service.findByCourse(courseId);
  }

  @Patch(':moduleId')
  @ApiOperation({ summary: 'Update module' })
  update(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateCourseModuleDto,
  ) {
    return this.service.update(moduleId, dto);
  }

  @Delete(':moduleId')
  @ApiOperation({ summary: 'Delete module' })
  remove(@Param('moduleId') moduleId: string) {
    return this.service.remove(moduleId);
  }
}
