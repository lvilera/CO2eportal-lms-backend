import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginatedQueryDto } from 'src/common/dto/pagination.dto';

export class CourseLessonQueryDto extends PaginatedQueryDto {
  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  moduleId?: string;
}
