// dto/submit-quiz-attempt.dto.ts
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SubmitQuizAnswerDto } from './submit-quiz-answer.dto';

export class SubmitQuizAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAnswerDto)
  answers: SubmitQuizAnswerDto[];
}
