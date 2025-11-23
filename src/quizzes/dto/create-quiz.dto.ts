import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsMongoId()
  courseId: string;

  @IsOptional()
  @IsMongoId()
  moduleId?: string;

  @IsOptional()
  @IsMongoId()
  lessonId?: string;

  @IsNumber()
  @Min(0)
  timeLimitSeconds?: number;

  @IsNumber()
  @Min(1)
  attemptsAllowed: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  passMarkPercent: number;

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean;

  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  @IsOptional()
  availableFrom?: Date;

  @IsOptional()
  availableUntil?: Date;
}
