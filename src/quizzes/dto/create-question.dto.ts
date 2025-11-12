import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class OptionDto {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({
    enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer'],
  })
  @IsEnum(['single_choice', 'multiple_choice', 'true_false', 'short_answer'])
  type!: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';

  @ApiProperty()
  @IsString()
  text!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ValidateIf((o) =>
    ['single_choice', 'multiple_choice', 'true_false'].includes(o.type),
  )
  @ApiPropertyOptional({ type: [OptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];

  @ValidateIf((o) => o.type === 'short_answer')
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answerText?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number = 1;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number = 0;
}
