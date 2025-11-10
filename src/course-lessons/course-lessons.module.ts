import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseLessonsController } from './course-lessons.controller';
import { CourseLessonsService } from './course-lessons.service';
import {
  CourseLesson,
  CourseLessonSchema,
} from './schemas/course-lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseLesson.name, schema: CourseLessonSchema },
    ]),
  ],
  providers: [CourseLessonsService],
  controllers: [CourseLessonsController],
})
export class CourseLessonsModule {}
