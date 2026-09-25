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

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '+84912345678' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class RegisterRequestDto extends BaseRequestDto<RegisterDto> {
  @ApiProperty({ type: () => RegisterDto })
  @ValidateNested()
  @Type(() => RegisterDto)
  declare data: RegisterDto;
}
