import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // QUIZ CRUD ENDPOINTS

  @Post()
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
  ) {
    return this.quizzesService.findAll(page, limit, courseId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }

  // QUIZ MANAGEMENT ENDPOINTS

  @Put(':id/publish')
  publishQuiz(@Param('id') id: string) {
    return this.quizzesService.publishQuiz(id);
  }

  @Put(':id/archive')
  archiveQuiz(@Param('id') id: string) {
    return this.quizzesService.archiveQuiz(id);
  }

  @Get(':id/validate')
  validateQuiz(@Param('id') id: string) {
    return this.quizzesService.validateQuizConfiguration(id);
  }

  @Get(':id/stats')
  getQuizStats(@Param('id') id: string) {
    return this.quizzesService.getQuizStats(id);
  }

  // QUESTION MANAGEMENT ENDPOINTS

  @Post('questions')
  addQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.quizzesService.addQuestion(createQuestionDto);
  }

  @Put('questions/:questionId')
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateData: Partial<UpdateQuizDto>,
  ) {
    return this.quizzesService.updateQuestion(questionId, updateData);
  }

  @Delete('questions/:questionId')
  removeQuestion(@Param('questionId') questionId: string) {
    return this.quizzesService.removeQuestion(questionId);
  }

  @Get(':id/questions')
  getQuizQuestions(@Param('id') id: string) {
    return this.quizzesService.getQuizQuestions(id);
  }

  @Put(':id/reorder-questions')
  reorderQuestions(
    @Param('id') id: string,
    @Body('questionOrder') questionOrder: string[],
  ) {
    return this.quizzesService.reorderQuestions(id, questionOrder);
  }

  // STUDENT ENDPOINTS

  @Get('student/:id')
  getQuizForStudent(@Param('id') id: string) {
    return this.quizzesService.getQuizForStudent(id);
  }
}
