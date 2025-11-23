import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CertificatesModule } from './certificates/certificates.module';
import { CourseCategoryModule } from './course-category/course-category.module';
import { CourseLessonsModule } from './course-lessons/course-lessons.module';
import { CourseModuleModule } from './course-module/course-module.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { QuizAttemptModule } from './quiz-attempts/quiz-attempt.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads', // public base path
    }),
    AuthModule,
    UsersModule,
    CourseCategoryModule,
    CourseModule,
    CourseModuleModule,
    CourseLessonsModule,
    EnrollmentModule,
    QuizzesModule,
    QuizAttemptModule,
    CertificatesModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
