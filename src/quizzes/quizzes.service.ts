import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Quiz, QuizDocument } from './schemas/quiz.schema';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private qModel: Model<QuestionDocument>,
  ) {}

  createQuiz(
    courseId: string,
    dto: CreateQuizDto,
    ctx?: { moduleId?: string; lessonId?: string },
  ) {
    const base: any = { ...dto, courseId: new Types.ObjectId(courseId) };
    if (ctx?.moduleId) base.moduleId = new Types.ObjectId(ctx.moduleId);
    if (ctx?.lessonId) base.lessonId = new Types.ObjectId(ctx.lessonId);
    return this.quizModel.create(base);
  }

  listQuizzesByCourse(courseId: string) {
    return this.quizModel.find({ courseId });
  }

  async getQuiz(id: string) {
    const doc = await this.quizModel.findById(id);
    if (!doc) throw new NotFoundException('Quiz not found');
    return doc;
  }

  async updateQuiz(id: string, dto: Partial<CreateQuizDto>) {
    const doc = await this.quizModel.findByIdAndUpdate(id, dto, { new: true });
    if (!doc) throw new NotFoundException('Quiz not found');
    return doc;
  }

  async removeQuiz(id: string) {
    const res = await this.quizModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Quiz not found');
    await this.qModel.deleteMany({ quizId: id });
    return { success: true };
  }

  // Questions
  async addQuestion(quizId: string, dto: CreateQuestionDto) {
    const q = await this.qModel.create({
      ...dto,
      quizId: new Types.ObjectId(quizId),
    });
    await this.quizModel.findByIdAndUpdate(quizId, {
      $addToSet: { questionOrder: q._id },
    });
    return q;
  }

  listQuestions(quizId: string) {
    return this.qModel.find({ quizId }).sort({ position: 1 });
  }

  async updateQuestion(questionId: string, dto: Partial<CreateQuestionDto>) {
    const q = await this.qModel.findByIdAndUpdate(questionId, dto, {
      new: true,
    });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  async removeQuestion(quizId: string, questionId: string) {
    const res = await this.qModel.findByIdAndDelete(questionId);
    if (!res) throw new NotFoundException('Question not found');
    await this.quizModel.findByIdAndUpdate(quizId, {
      $pull: { questionOrder: new Types.ObjectId(questionId) },
    });
    return { success: true };
  }
}
