import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignCourseDto {
  @ApiProperty({ example: '672a5f6d4c0e9afc51a12345' })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;
}
