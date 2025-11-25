import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourseLessonsService } from './course-lessons.service';
import { CourseLessonQueryDto } from './dto/course-lesson-query.dto';
import { CreateCourseLessonDto } from './dto/create-course-lesson.dto';
import { UpdateCourseLessonDto } from './dto/update-course-lesson.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class CourseLessonsController {
  constructor(private readonly service: CourseLessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course lesson' })
  @ApiResponse({ status: 201, description: 'Course created' })
  create(@Body() dto: CreateCourseLessonDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List course lessons (paginated + search)' })
  findAll(@Query() q: CourseLessonQueryDto) {
    return this.service.findAll(q);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a course lesson by id or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a course lesson' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
