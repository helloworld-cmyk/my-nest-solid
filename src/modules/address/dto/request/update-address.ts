import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Theresa Webb' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '3517 W. Gray St. Utica, Pennsylvania 57867',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Willie.Jennings@example.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: '(480) 555-0103' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressRequestDto extends BaseRequestDto<UpdateAddressDto> {
  @ApiPropertyOptional({ type: () => UpdateAddressDto })
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  declare data: UpdateAddressDto;
}
