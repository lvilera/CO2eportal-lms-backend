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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizzesService } from './quizzes.service';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('courses/:courseId/quizzes')
export class QuizzesController {
  constructor(private readonly service: QuizzesService) {}

  @Post()
  @ApiOperation({
    summary:
      'Create a course-level quiz (optionally provide moduleId/lessonId in query)',
  })
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateQuizDto,
    @Query('moduleId') moduleId?: string,
    @Query('lessonId') lessonId?: string,
  ) {
    return this.service.createQuiz(courseId, dto, { moduleId, lessonId });
  }

  @Get()
  @ApiOperation({ summary: 'List quizzes by course' })
  list(@Param('courseId') courseId: string) {
    return this.service.listQuizzesByCourse(courseId);
  }

  @Get(':quizId')
  @ApiOperation({ summary: 'Get quiz' })
  get(@Param('quizId') quizId: string) {
    return this.service.getQuiz(quizId);
  }

  @Put(':quizId')
  @ApiOperation({ summary: 'Update quiz' })
  update(@Param('quizId') quizId: string, @Body() dto: Partial<CreateQuizDto>) {
    return this.service.updateQuiz(quizId, dto);
  }

  @Delete(':quizId')
  @ApiOperation({ summary: 'Delete quiz (and its questions)' })
  remove(@Param('quizId') quizId: string) {
    return this.service.removeQuiz(quizId);
  }

  // Questions (nested)
  @Post(':quizId/questions')
  @ApiOperation({ summary: 'Add question to quiz' })
  addQ(@Param('quizId') quizId: string, @Body() dto: CreateQuestionDto) {
    return this.service.addQuestion(quizId, dto);
  }

  @Get(':quizId/questions')
  @ApiOperation({ summary: 'List questions for quiz' })
  listQ(@Param('quizId') quizId: string) {
    return this.service.listQuestions(quizId);
  }

  @Put(':quizId/questions/:questionId')
  @ApiOperation({ summary: 'Update question' })
  updQ(
    @Param('questionId') questionId: string,
    @Body() dto: Partial<CreateQuestionDto>,
  ) {
    return this.service.updateQuestion(questionId, dto);
  }

  @Delete(':quizId/questions/:questionId')
  @ApiOperation({ summary: 'Delete question from quiz' })
  delQ(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.service.removeQuestion(quizId, questionId);
  }
}
