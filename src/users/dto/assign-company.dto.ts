import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignCompanyDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '6730afbc12aeab1f90d12345' })
  @IsMongoId()
  @IsNotEmpty()
  companyId: string;
}
