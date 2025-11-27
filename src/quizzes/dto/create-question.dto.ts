import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Option text as shown to the learner',
    example: 'Carbon dioxide (CO₂)',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Marks whether this option is correct',
    example: true,
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({
    description: 'Explanation shown when reviewing the answer',
    example: 'CO₂ is the primary greenhouse gas emitted by human activities.',
  })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Parent quiz ID',
    example: '672a91c4c2ab2f0012d91ae4',
  })
  @IsMongoId()
  quizId: string;

  @ApiProperty({
    description: 'Question type',
    enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer'],
    example: 'single_choice',
  })
  @IsEnum(['single_choice', 'multiple_choice', 'true_false', 'short_answer'])
  type: string;

  @ApiProperty({
    description: 'Question text',
    example: 'Which gas is the main contributor to global warming?',
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description:
      'General explanation for the question (used in review/feedback)',
    example:
      'Understanding greenhouse gases helps organizations build effective net-zero strategies.',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    description:
      'List of answer options (required for choice-based questions). For true/false, you can either use options or handle it as a special case.',
    type: () => [QuestionOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @ApiPropertyOptional({
    description:
      'Correct answer text (used for short answer or open-ended questions)',
    example: 'Carbon dioxide',
  })
  @IsOptional()
  @IsString()
  answerText?: string;

  @ApiProperty({
    description: 'Points allocated for this question',
    example: 5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({
    description: 'Position/order of the question within the quiz',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({
    description:
      'Time limit for this question in seconds (0 or undefined = no per-question limit)',
    example: 60,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeLimitSeconds?: number;

  @ApiPropertyOptional({
    description: 'Difficulty level of the question',
    enum: ['easy', 'medium', 'hard'],
    example: 'medium',
  })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;
}
