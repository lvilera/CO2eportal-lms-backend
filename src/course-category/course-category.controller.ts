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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedQueryDto } from 'src/common/dto/pagination.dto';
import { CourseCategoryService } from './course-category.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';

@Controller('course-category')
export class CourseCategoryController {
  constructor(private readonly service: CourseCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  create(@Body() dto: CreateCourseCategoryDto) {
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

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a course' })
  remove(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
