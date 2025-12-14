import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @IsMongoId()
  @ApiProperty()
  userId: string;

  @IsMongoId()
  @ApiProperty()
  courseId: string;

  @IsOptional()
  @ApiProperty()
  @IsEnum(['active', 'completed', 'dropped', 'suspended'])
  status?: string;
}
