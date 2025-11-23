// dto/submit-quiz-answer.dto.ts
import { IsArray, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class SubmitQuizAnswerDto {
  @IsMongoId()
  questionId: string;

  @IsArray()
  @IsOptional()
  selectedAnswers?: string[];

  @IsOptional()
  answerText?: string;

  @IsNumber()
  @Min(0)
  timeSpent: number; // in seconds
}
