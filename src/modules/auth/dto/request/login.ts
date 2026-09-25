import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class LoginRequestDto extends BaseRequestDto<LoginDto> {
  @ApiProperty({ type: () => LoginDto })
  @ValidateNested()
  @Type(() => LoginDto)
  declare data: LoginDto;
}
