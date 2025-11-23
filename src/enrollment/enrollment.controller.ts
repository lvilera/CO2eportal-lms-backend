// controllers/enrollment.controller.ts
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
import { PaginatedQueryDto } from 'src/common/dto/pagination.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentService } from './enrollment.service';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  findAll(@Query() q: PaginatedQueryDto) {
    return this.enrollmentService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Get('user/:userId/course/:courseId')
  findByUserAndCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentService.findByUserAndCourse(userId, courseId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(id, updateEnrollmentDto);
  }

  @Put(':id/progress')
  updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.enrollmentService.updateProgress(id, progress);
  }

  @Put(':id/position')
  updateCurrentPosition(
    @Param('id') id: string,
    @Body('currentModule') currentModule: string,
    @Body('currentLesson') currentLesson: string,
  ) {
    return this.enrollmentService.updateCurrentPosition(
      id,
      currentModule,
      currentLesson,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(id);
  }

  @Get('user/:userId')
  getUserEnrollments(@Param('userId') userId: string) {
    return this.enrollmentService.getUserEnrollments(userId);
  }

  @Get('course/:courseId')
  getCourseEnrollments(@Param('courseId') courseId: string) {
    return this.enrollmentService.getCourseEnrollments(courseId);
  }

  @Get('stats/overview')
  getEnrollmentStats(@Query('courseId') courseId?: string) {
    return this.enrollmentService.getEnrollmentStats(courseId);
  }
}
