// services/quiz-attempt.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Question,
  QuestionDocument,
} from 'src/quizzes/schemas/question.schema';
import { Quiz, QuizDocument } from 'src/quizzes/schemas/quiz.schema';
import { StartQuizAttemptDto } from './dto/start-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import {
  QuizAttempt,
  QuizAttemptDocument,
} from './schemas/quiz-attempt.schema';

@Injectable()
export class QuizAttemptService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private quizAttemptModel: Model<QuizAttemptDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  // Start a new quiz attempt
  async startAttempt(
    userId: string,
    startQuizAttemptDto: StartQuizAttemptDto,
  ): Promise<QuizAttempt> {
    const quiz = await this.quizModel
      .findById(startQuizAttemptDto.quizId)
      .populate('questionOrder')
      .exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if quiz is available
    this.validateQuizAvailability(quiz);

    // Get current attempt number
    const lastAttempt = await this.quizAttemptModel
      .findOne({
        userId: new Types.ObjectId(userId),
        quizId: new Types.ObjectId(startQuizAttemptDto.quizId),
      })
      .sort({ attemptNumber: -1 })
      .exec();

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Check max attempts
    if (attemptNumber > quiz.attemptsAllowed) {
      throw new ConflictException('Maximum attempts reached for this quiz');
    }

    // Check if there's an existing in-progress attempt
    const existingInProgress = await this.quizAttemptModel.findOne({
      userId: new Types.ObjectId(userId),
      quizId: new Types.ObjectId(startQuizAttemptDto.quizId),
      status: 'in_progress',
    });

    if (existingInProgress) {
      return existingInProgress; // Return existing in-progress attempt
    }

    const attempt = new this.quizAttemptModel({
      userId: new Types.ObjectId(userId),
      quizId: new Types.ObjectId(startQuizAttemptDto.quizId),
      courseId: quiz.courseId,
      attemptNumber,
      startedAt: new Date(),
      status: 'in_progress',
      // totalPoints: await this.calculateTotalPoints(quiz.questionOrder as any),
    });

    return attempt.save();
  }

  // Submit quiz attempt
  async submitAttempt(
    attemptId: string,
    userId: string,
    submitData: SubmitQuizAttemptDto,
  ): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptModel
      .findById(attemptId)
      .populate('quizId')
      .exec();

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    // Check ownership
    if (attempt.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You can only submit your own quiz attempts',
      );
    }

    // Check if already completed
    if (attempt.status === 'completed') {
      throw new ConflictException(
        'This quiz attempt has already been completed',
      );
    }

    const quiz = attempt.quizId as any;

    // Get all questions for this quiz
    const questions = await this.questionModel
      .find({ _id: { $in: quiz.questionOrder } })
      .exec();

    // Calculate results
    const results = await this.calculateResults(questions, submitData.answers);

    const completedAt = new Date();
    const totalTimeSpent = Math.floor(
      (completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    // Update attempt
    attempt.answers = results.answers;
    attempt.pointsEarned = results.totalPointsEarned;
    attempt.score = results.score;
    attempt.timeSpent = totalTimeSpent;
    attempt.completedAt = completedAt;
    attempt.status = 'completed';

    // Add feedback
    if (attempt.score >= quiz.passMarkPercent) {
      attempt.feedback = `Congratulations! You passed with ${attempt.score}%`;
    } else {
      attempt.feedback = `You scored ${attempt.score}%. The passing mark is ${quiz.passMarkPercent}%.`;
    }

    return attempt.save();
  }

  // Save answer without submitting (for auto-save)
  async saveAnswer(
    attemptId: string,
    userId: string,
    answerData: any,
  ): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptModel.findById(attemptId).exec();

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update your own quiz attempts',
      );
    }

    if (attempt.status === 'completed') {
      throw new ConflictException('Cannot update completed quiz attempt');
    }

    // Find existing answer index
    const answerIndex = attempt.answers.findIndex(
      (a) => a.questionId.toString() === answerData.questionId,
    );

    if (answerIndex >= 0) {
      // Update existing answer
      attempt.answers[answerIndex] = {
        ...attempt.answers[answerIndex],
        ...answerData,
      };
    } else {
      // Add new answer
      attempt.answers.push({
        questionId: new Types.ObjectId(answerData.questionId),
        selectedAnswers: answerData.selectedAnswers || [],
        answerText: answerData.answerText,
        timeSpent: answerData.timeSpent,
        pointsEarned: 0,
      });
    }

    return attempt.save();
  }

  // Get user's quiz attempts
  async getUserAttempts(
    userId: string,
    courseId?: string,
  ): Promise<QuizAttempt[]> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (courseId) {
      filter.courseId = new Types.ObjectId(courseId);
    }

    return this.quizAttemptModel
      .find(filter)
      .populate('quizId', 'title passMarkPercent timeLimitSeconds')
      .populate('courseId', 'title')
      .sort({ startedAt: -1 })
      .exec();
  }

  // Get specific attempt with details
  async getAttemptDetails(attemptId: string, userId: string): Promise<any> {
    const attempt = await this.quizAttemptModel
      .findById(attemptId)
      .populate('quizId')
      .populate('courseId', 'title')
      .exec();

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const quiz = attempt.quizId as any;
    const questions = await this.questionModel
      .find({ _id: { $in: quiz.questionOrder } })
      .exec();

    return {
      attempt,
      quiz,
      questions: this.prepareQuestionsForReview(questions, attempt.answers),
      summary: {
        totalQuestions: questions.length,
        answeredQuestions: attempt.answers.length,
        correctAnswers: attempt.answers.filter((a) => a.isCorrect).length,
        timeSpent: this.formatTime(attempt.timeSpent),
      },
    };
  }

  // Get current in-progress attempt for a quiz
  async getCurrentAttempt(
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt | null> {
    return this.quizAttemptModel
      .findOne({
        userId: new Types.ObjectId(userId),
        quizId: new Types.ObjectId(quizId),
        status: 'in_progress',
      })
      .exec();
  }

  // Get quiz statistics for student
  async getStudentQuizStats(userId: string, courseId?: string): Promise<any> {
    const filter: any = {
      userId: new Types.ObjectId(userId),
      status: 'completed',
    };

    if (courseId) {
      filter.courseId = new Types.ObjectId(courseId);
    }

    const stats = await this.quizAttemptModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$quizId',
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$score' },
          averageScore: { $avg: '$score' },
          lastAttempt: { $max: '$completedAt' },
          totalTimeSpent: { $sum: '$timeSpent' },
        },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quiz',
        },
      },
      { $unwind: '$quiz' },
    ]);

    const totalQuizzes = await this.quizAttemptModel.distinct('quizId', filter);
    const passedQuizzes = stats.filter(
      (stat) => stat.bestScore >= stat.quiz.passMarkPercent,
    ).length;

    return {
      totalQuizzesAttempted: totalQuizzes.length,
      totalAttempts: stats.reduce((sum, stat) => sum + stat.totalAttempts, 0),
      passedQuizzes,
      averageScore:
        stats.length > 0
          ? stats.reduce((sum, stat) => sum + stat.averageScore, 0) /
            stats.length
          : 0,
      quizStats: stats,
    };
  }

  // Private helper methods
  private validateQuizAvailability(quiz: any): void {
    const now = new Date();

    if (quiz.status !== 'published') {
      throw new BadRequestException('This quiz is not available');
    }

    if (quiz.availableFrom && now < quiz.availableFrom) {
      throw new BadRequestException('Quiz is not available yet');
    }

    if (quiz.availableUntil && now > quiz.availableUntil) {
      throw new BadRequestException('Quiz is no longer available');
    }
  }

  private async calculateTotalPoints(
    questionIds: Types.ObjectId[],
  ): Promise<number> {
    const questions = await this.questionModel
      .find({ _id: { $in: questionIds } })
      .select('points')
      .exec();

    return questions.reduce((total, question) => total + question.points, 0);
  }

  private async calculateResults(
    questions: Question[],
    userAnswers: any[],
  ): Promise<any> {
    let totalPointsEarned = 0;
    const totalPossiblePoints = questions.reduce(
      (total, q) => total + q.points,
      0,
    );

    const evaluatedAnswers = userAnswers
      .map((userAnswer) => {
        const question = questions.find(
          (q) => q?.['_id'].toString() === userAnswer.questionId,
        );
        if (!question) return null;

        let isCorrect = false;
        let pointsEarned = 0;

        switch (question.type) {
          case 'single_choice':
          case 'multiple_choice':
            const correctOptionIds =
              question.options
                ?.filter((opt) => opt.isCorrect)
                .map((opt) => opt?.['_id'].toString()) || [];

            const userSelectedIds = userAnswer.selectedAnswers || [];

            isCorrect = this.arraysEqual(
              userSelectedIds.sort(),
              correctOptionIds.sort(),
            );
            pointsEarned = isCorrect ? question.points : 0;
            break;

          case 'true_false':
            const correctAnswer = question.options
              ?.find((opt) => opt.isCorrect)
              ?.['_id'].toString();
            isCorrect = userAnswer.selectedAnswers?.[0] === correctAnswer;
            pointsEarned = isCorrect ? question.points : 0;
            break;

          case 'short_answer':
            // For short answer, manual grading might be needed
            // For now, we'll mark as needing review
            isCorrect = false;
            pointsEarned = 0;
            break;
        }

        totalPointsEarned += pointsEarned;

        return {
          questionId: new Types.ObjectId(userAnswer.questionId),
          selectedAnswers: userAnswer.selectedAnswers || [],
          answerText: userAnswer.answerText,
          isCorrect,
          pointsEarned,
          timeSpent: userAnswer.timeSpent,
        };
      })
      .filter(Boolean);

    const score =
      totalPossiblePoints > 0
        ? (totalPointsEarned / totalPossiblePoints) * 100
        : 0;

    return {
      answers: evaluatedAnswers,
      totalPointsEarned,
      score: Math.round(score * 100) / 100,
    };
  }

  private prepareQuestionsForReview(
    questions: Question[],
    answers: any[],
  ): any[] {
    return questions.map((question) => {
      const userAnswer = answers.find(
        (a) => a.questionId.toString() === question?.['_id'].toString(),
      );

      return {
        _id: question?.['_id'],
        text: question.text,
        type: question.type,
        explanation: question.explanation,
        options: question.options,
        points: question.points,
        position: question.position,
        timeLimitSeconds: question.timeLimitSeconds,
        difficulty: question.difficulty,
        userAnswer: userAnswer || null,
        isAnswered: !!userAnswer,
      };
    });
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
