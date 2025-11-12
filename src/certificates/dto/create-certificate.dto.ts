import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty()
  @IsString()
  courseId!: string;

  @ApiProperty()
  @IsString()
  certificateNumber!: string;

  @ApiProperty()
  @IsDateString()
  issuedAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  verifiableUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: {
    gradePercent?: number;
    instructorName?: string;
    templateId?: string;
  };
}
