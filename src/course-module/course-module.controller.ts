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
import { CourseModuleService } from './course-module.service';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';

@ApiTags('Modules')
@ApiBearerAuth()
@Controller('modules')
export class CourseModuleController {
  constructor(private readonly service: CourseModuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course lesson' })
  @ApiResponse({ status: 201, description: 'Course created' })
  create(@Body() dto: CreateCourseModuleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List course lessons (paginated + search)' })
  findAll(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a course lesson by id or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseModuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a course lesson' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
