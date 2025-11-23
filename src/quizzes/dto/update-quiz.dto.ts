import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateQuizDto } from './create-quiz.dto';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @IsString()
  questionOrder: string;
}
