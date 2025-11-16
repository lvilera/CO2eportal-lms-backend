import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModuleController } from './course-module.controller';
import { CourseModuleService } from './course-module.service';
import { CourseModule, CourseModuleSchema } from './schemas/couseModule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseModule.name, schema: CourseModuleSchema },
    ]),
  ],
  controllers: [CourseModuleController],
  providers: [CourseModuleService],
  exports: [CourseModuleService],
})
export class CourseModuleModule {}
