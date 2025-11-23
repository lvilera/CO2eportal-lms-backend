import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  courseId: string;

  @IsOptional()
  @IsEnum(['active', 'completed', 'dropped', 'suspended'])
  status?: string;
}
