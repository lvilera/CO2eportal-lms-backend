import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseCategoryController } from './course-category.controller';
import { CourseCategoryService } from './course-category.service';
import {
  CourseCategory,
  CourseCategorySchema,
} from './schemas/course-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseCategory.name, schema: CourseCategorySchema },
    ]),
  ],
  providers: [CourseCategoryService],
  controllers: [CourseCategoryController],
})
export class CourseCategoryModule {}
