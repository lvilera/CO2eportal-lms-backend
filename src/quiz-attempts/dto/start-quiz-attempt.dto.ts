import { IsMongoId } from 'class-validator';

export class StartQuizAttemptDto {
  @IsMongoId()
  quizId: string;
}
