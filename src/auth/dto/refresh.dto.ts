import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token (JWT)' })
  @IsString()
  @IsJWT()
  refreshToken: string;
}
