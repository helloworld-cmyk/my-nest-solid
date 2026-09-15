import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

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
