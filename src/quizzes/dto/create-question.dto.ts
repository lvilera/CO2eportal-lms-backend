import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class QuestionOptionDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuestionDto {
  @IsMongoId()
  quizId: string;

  @IsEnum(['single_choice', 'multiple_choice', 'true_false', 'short_answer'])
  type: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @IsOptional()
  @IsString()
  answerText?: string;

  @IsNumber()
  @Min(0)
  points: number;

  @IsNumber()
  @Min(0)
  position: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeLimitSeconds?: number;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;
}
