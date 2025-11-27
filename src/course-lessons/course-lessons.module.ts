import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from 'src/quizzes/schemas/question.schema';
import { Quiz, QuizSchema } from 'src/quizzes/schemas/quiz.schema';
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
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [CourseLessonsService],
  controllers: [CourseLessonsController],
})
export class CourseLessonsModule {}
