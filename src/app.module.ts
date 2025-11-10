import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CourseLessonsModule } from './course-lessons/course-lessons.module';
import { CourseModuleModule } from './course-module/course-module.module';
import { CourseModule } from './course/course.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    UsersModule,
    AuthModule,
    CourseModule,
    CourseModuleModule,
    CourseLessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
