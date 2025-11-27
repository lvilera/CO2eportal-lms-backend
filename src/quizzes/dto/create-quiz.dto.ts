import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Quiz title displayed to learners',
    example: 'Module 1: Introduction Quiz',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Guidelines or instructions for the quiz',
    example: 'Please read each question carefully. You have 10 minutes.',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    description: 'Associated Course ID',
    example: '672a91c4c2ab2f0012d91ae4',
  })
  @IsMongoId()
  courseId: string;

  @ApiPropertyOptional({
    description: 'Optional Module ID if quiz belongs to a module',
    example: '672a91c4c2ab2f0012d91ae5',
  })
  @IsOptional()
  @IsMongoId()
  moduleId?: string;

  @ApiPropertyOptional({
    description: 'Time limit in seconds (0 means no limit)',
    example: 600,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeLimitSeconds?: number;

  @ApiProperty({
    description: 'Number of attempts allowed',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  attemptsAllowed: number;

  @ApiProperty({
    description: 'Passing score in percentage',
    example: 70,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  passMarkPercent: number;

  @ApiPropertyOptional({
    description: 'Enable randomization of question order',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({
    description: 'Enable randomization of options inside each question',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean;

  @ApiPropertyOptional({
    description: 'Quiz status',
    enum: ['draft', 'published', 'archived'],
    example: 'draft',
    default: 'draft',
  })
  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'When the quiz becomes available',
    example: '2025-01-15T09:00:00.000Z',
  })
  @IsOptional()
  availableFrom?: Date;

  @ApiPropertyOptional({
    description: 'When the quiz closes',
    example: '2025-01-31T23:59:59.000Z',
  })
  @IsOptional()
  availableUntil?: Date;
}
