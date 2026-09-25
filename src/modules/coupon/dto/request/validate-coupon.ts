import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class ValidateCouponDto {
  @ApiProperty({
    example: 'SAVE10',
    description: 'Coupon code (case-insensitive)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    example: 150,
    description:
      'Cart subtotal used to check minimum order and compute discount',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal!: number;
}

export class ValidateCouponRequestDto extends BaseRequestDto<ValidateCouponDto> {
  @ApiProperty({ type: () => ValidateCouponDto })
  @ValidateNested()
  @Type(() => ValidateCouponDto)
  declare data: ValidateCouponDto;
}
