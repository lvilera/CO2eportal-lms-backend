import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Inteloraa LLC',
    description: 'Company name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Full-service software development company.',
    description: 'Short description about the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    example: 25,
    description: 'Number of seats / employees / licenses',
  })
  @IsInt()
  @IsPositive()
  seat: number;

  @ApiProperty({
    example: ['React Fundamentals', 'NestJS Advanced'],
    description: 'Courses list',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  courses?: string[];
}
