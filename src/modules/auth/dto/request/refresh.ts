import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Valid refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class RefreshTokenRequestDto extends BaseRequestDto<RefreshTokenDto> {
  @ApiProperty({ type: () => RefreshTokenDto })
  @ValidateNested()
  @Type(() => RefreshTokenDto)
  declare data: RefreshTokenDto;
}
