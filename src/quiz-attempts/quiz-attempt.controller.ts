// controllers/quiz-attempt.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAttemptService } from './quiz-attempt.service';

@Controller('student/quiz-attempt')
@UseGuards(JwtAuthGuard)
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  @Post('start')
  async startAttempt(
    @Request() req,
    @Body() startQuizAttemptDto: StartQuizAttemptDto,
  ) {
    return this.quizAttemptService.startAttempt(
      req.user.userId,
      startQuizAttemptDto,
    );
  }

  @Put(':attemptId/submit')
  async submitAttempt(
    @Request() req,
    @Param('attemptId') attemptId: string,
    @Body() submitQuizAttemptDto: SubmitQuizAttemptDto,
  ) {
    return this.quizAttemptService.submitAttempt(
      attemptId,
      req.user.userId,
      submitQuizAttemptDto,
    );
  }

  @Put(':attemptId/answer')
  async saveAnswer(
    @Request() req,
    @Param('attemptId') attemptId: string,
    @Body() answerData: any,
  ) {
    return this.quizAttemptService.saveAnswer(
      attemptId,
      req.user.userId,
      answerData,
    );
  }

  @Get()
  async getUserAttempts(@Request() req, @Query('courseId') courseId?: string) {
    return this.quizAttemptService.getUserAttempts(req.user.userId, courseId);
  }

  @Get(':attemptId')
  async getAttemptDetails(
    @Request() req,
    @Param('attemptId') attemptId: string,
  ) {
    return this.quizAttemptService.getAttemptDetails(
      attemptId,
      req.user.userId,
    );
  }

  @Get('quiz/:quizId/current')
  async getCurrentAttempt(@Request() req, @Param('quizId') quizId: string) {
    return this.quizAttemptService.getCurrentAttempt(req.user.userId, quizId);
  }

  @Get('stats/overview')
  async getStudentStats(@Request() req, @Query('courseId') courseId?: string) {
    return this.quizAttemptService.getStudentQuizStats(
      req.user.userId,
      courseId,
    );
  }
}
