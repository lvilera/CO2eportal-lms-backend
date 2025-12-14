import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @IsOptional()
  @ApiProperty()
  progress?: number;

  @IsOptional()
  @ApiProperty()
  currentModule?: string;

  @IsOptional()
  @ApiProperty()
  currentLesson?: string;

  @IsOptional()
  @ApiProperty()
  completionDate?: Date;
}
