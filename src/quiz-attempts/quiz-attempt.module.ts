import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizzesModule } from 'src/quizzes/quizzes.module';
import { Question, QuestionSchema } from 'src/quizzes/schemas/question.schema';
import { Quiz, QuizSchema } from 'src/quizzes/schemas/quiz.schema';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';

@Module({
  imports: [
    QuizzesModule,
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
    ]),
  ],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService],
})
export class QuizAttemptModule {}
