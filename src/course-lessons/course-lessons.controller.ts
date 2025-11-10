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
import { CourseLessonsService } from './course-lessons.service';
import { CreateCourseLessonDto } from './dto/create-course-lesson.dto';
import { UpdateCourseLessonDto } from './dto/update-course-lesson.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('courses/:courseId/modules/:moduleId/lessons')
export class CourseLessonsController {
  constructor(private readonly service: CourseLessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create lesson under a module' })
  create(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateCourseLessonDto,
  ) {
    return this.service.create(courseId, moduleId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List lessons for a module' })
  list(@Param('moduleId') moduleId: string) {
    return this.service.findByModule(moduleId);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get lesson by id or slug' })
  getOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }

  @Patch(':lessonId')
  @ApiOperation({ summary: 'Update lesson' })
  update(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateCourseLessonDto,
  ) {
    return this.service.update(lessonId, dto);
  }

  @Delete(':lessonId')
  @ApiOperation({ summary: 'Delete lesson' })
  remove(@Param('lessonId') lessonId: string) {
    return this.service.remove(lessonId);
  }
}
