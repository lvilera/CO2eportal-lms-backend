import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Quiz, QuizDocument } from './schemas/quiz.schema';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  // QUIZ CRUD OPERATIONS

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = new this.quizModel(createQuizDto);
    return quiz.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    courseId?: string,
    status?: string,
  ): Promise<{
    data: Quiz[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter: any = {};

    if (courseId) filter.courseId = new Types.ObjectId(courseId);
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.quizModel
        .find(filter)
        .populate('courseId', 'title')
        .populate('moduleId', 'title')
        .populate('lessonId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.quizModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel
      .findById(id)
      .populate('courseId', 'title')
      .populate('moduleId', 'title')
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true, runValidators: true })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async remove(id: string): Promise<{ message: string }> {
    const quiz = await this.quizModel.findById(id).exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Delete associated questions
    await this.questionModel
      .deleteMany({ quizId: new Types.ObjectId(id) })
      .exec();

    // Delete the quiz
    await this.quizModel.findByIdAndDelete(id).exec();

    return { message: 'Quiz and associated questions deleted successfully' };
  }

  // QUIZ MANAGEMENT METHODS

  async publishQuiz(id: string): Promise<Quiz> {
    const quiz = await this.quizModel
      .findByIdAndUpdate(id, { status: 'published' }, { new: true })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async archiveQuiz(id: string): Promise<Quiz> {
    const quiz = await this.quizModel
      .findByIdAndUpdate(id, { status: 'archived' }, { new: true })
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async calculateTotalPoints(quizId: string): Promise<number> {
    const questions = await this.questionModel
      .find({ quizId: new Types.ObjectId(quizId) })
      .exec();

    const totalPoints = questions.reduce(
      (total, question) => total + question.points,
      0,
    );

    await this.quizModel.findByIdAndUpdate(quizId, { totalPoints }).exec();

    return totalPoints;
  }

  // QUESTION MANAGEMENT METHODS
  async findAllQuestions(
    quizId?: string,
    status?: string,
  ): Promise<{ items: Question[] }> {
    const filter: any = {};

    if (quizId) filter.quizId = quizId;
    if (status) filter.status = status;

    const items = await this.questionModel
      .find(filter)
      .populate('quizId', 'title')
      .sort({ createdAt: -1 })
      .exec();

    return { items };
  }

  async addQuestion(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const quiz = await this.quizModel.findById(createQuestionDto.quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const question = new this.questionModel(createQuestionDto);
    const savedQuestion = await question.save();

    // Add question to quiz's questionOrder
    await this.quizModel
      .findByIdAndUpdate(createQuestionDto.quizId, {
        $push: { questionOrder: savedQuestion._id },
      })
      .exec();

    // Update total points
    await this.calculateTotalPoints(createQuestionDto.quizId);

    return savedQuestion;
  }

  async findOneQuestion(questionId: string): Promise<Question> {
    const question = await this.questionModel
      .findById(questionId)
      .populate('quizId', 'title')
      .exec();

    if (!question) {
      throw new NotFoundException(`Quiz with ID ${questionId} not found`);
    }

    return question;
  }

  async updateQuestion(
    questionId: string,
    updateData: Partial<Question>,
  ): Promise<Question> {
    const question = await this.questionModel
      .findByIdAndUpdate(questionId, updateData, { new: true })
      .exec();

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Update total points in quiz
    await this.calculateTotalPoints(question.quizId.toString());

    return question;
  }

  async removeQuestion(questionId: string): Promise<{ message: string }> {
    const question = await this.questionModel.findById(questionId).exec();

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Remove from quiz's questionOrder
    await this.quizModel
      .findByIdAndUpdate(question.quizId, {
        $pull: { questionOrder: new Types.ObjectId(questionId) },
      })
      .exec();

    // Delete the question
    await this.questionModel.findByIdAndDelete(questionId).exec();

    // Update total points
    await this.calculateTotalPoints(question.quizId.toString());

    return { message: 'Question deleted successfully' };
  }

  async getQuizQuestions(quizId: string): Promise<Question[]> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.questionModel
      .find({ quizId: new Types.ObjectId(quizId) })
      .sort({ position: 1 })
      .exec();
  }

  async reorderQuestions(
    quizId: string,
    questionOrder: string[],
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Validate that all question IDs belong to this quiz
    const questions = await this.questionModel
      .find({
        _id: { $in: questionOrder.map((id) => new Types.ObjectId(id)) },
        quizId: new Types.ObjectId(quizId),
      })
      .exec();

    if (questions.length !== questionOrder.length) {
      throw new BadRequestException(
        'Some questions do not belong to this quiz',
      );
    }

    // Update question positions
    await Promise.all(
      questionOrder.map((questionId, index) =>
        this.questionModel
          .findByIdAndUpdate(questionId, { position: index })
          .exec(),
      ),
    );

    // Update quiz questionOrder - FIXED: Handle possible null return
    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(
        quizId,
        { questionOrder: questionOrder.map((id) => new Types.ObjectId(id)) },
        { new: true },
      )
      .exec();

    if (!updatedQuiz) {
      throw new NotFoundException('Quiz not found after update');
    }

    return updatedQuiz;
  }

  // STUDENT-FACING METHODS

  async getQuizForStudent(quizId: string): Promise<any> {
    const quiz = await this.quizModel
      .findById(quizId)
      .populate({
        path: 'questionOrder',
        options: { sort: { position: 1 } },
      })
      .exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.status !== 'published') {
      throw new BadRequestException('This quiz is not available');
    }

    // Check availability
    const now = new Date();
    if (quiz.availableFrom && now < quiz.availableFrom) {
      throw new BadRequestException('Quiz is not available yet');
    }

    if (quiz.availableUntil && now > quiz.availableUntil) {
      throw new BadRequestException('Quiz is no longer available');
    }

    return {
      _id: quiz._id,
      title: quiz.title,
      instructions: quiz.instructions,
      timeLimitSeconds: quiz.timeLimitSeconds,
      totalPoints: quiz.totalPoints,
      passMarkPercent: quiz.passMarkPercent,
    };
  }

  async validateQuizConfiguration(
    quizId: string,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const questions = await this.questionModel
      .find({ quizId: new Types.ObjectId(quizId) })
      .exec();

    const errors: string[] = [];

    if (questions.length === 0) {
      errors.push('Quiz must have at least one question');
    }

    // Validate each question
    questions.forEach((question, index) => {
      if (
        ['single_choice', 'multiple_choice', 'true_false'].includes(
          question.type,
        )
      ) {
        if (!question.options || question.options.length < 2) {
          errors.push(`Question ${index + 1}: Must have at least 2 options`);
        }

        const correctOptions =
          question.options?.filter((opt) => opt.isCorrect) || [];
        if (correctOptions.length === 0) {
          errors.push(
            `Question ${index + 1}: Must have at least one correct option`,
          );
        }

        if (question.type === 'single_choice' && correctOptions.length > 1) {
          errors.push(
            `Question ${index + 1}: Single choice questions can only have one correct option`,
          );
        }
      }

      if (question.type === 'short_answer' && !question.answerText) {
        errors.push(
          `Question ${index + 1}: Short answer questions must have an answer text`,
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // STATISTICS AND ANALYTICS

  async getQuizStats(quizId: string): Promise<any> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const questions = await this.questionModel
      .find({ quizId: new Types.ObjectId(quizId) })
      .exec();

    const questionStats = questions.map((question) => ({
      _id: question._id,
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      points: question.points,
      options: question.options?.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        selectionCount: 0, // Would come from attempt analytics
      })),
    }));

    return {
      quizId: quiz._id,
      title: quiz.title,
      totalQuestions: questions.length,
      totalPoints: quiz.totalPoints,
      averageDifficulty: this.calculateAverageDifficulty(questions),
      questionStats,
    };
  }

  private calculateAverageDifficulty(questions: Question[]): string {
    const difficultyValues = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    const average =
      questions.reduce((sum, question) => {
        return sum + (difficultyValues[question.difficulty] || 2);
      }, 0) / questions.length;

    if (average < 1.5) return 'easy';
    if (average < 2.5) return 'medium';
    return 'hard';
  }
}
