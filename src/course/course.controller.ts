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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedQueryDto } from 'src/common/dto/pagination.dto';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CourseController {
  constructor(private readonly service: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  create(@Body() dto: CreateCourseDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List courses (paginated + search)' })
  findAll(@Query() q: PaginatedQueryDto) {
    return this.service.findAll(q);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a course by id or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a course' })
  remove(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
