import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @IsOptional()
  progress?: number;

  @IsOptional()
  currentModule?: string;

  @IsOptional()
  currentLesson?: string;

  @IsOptional()
  completionDate?: Date;
}
