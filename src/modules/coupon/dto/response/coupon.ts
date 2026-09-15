import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CouponType } from '../../../../../prisma/generated/prisma/enums.js';
import { PaginationMetaDto } from '../../../../dto/pagination.dto.js';

export const COUPON_TYPES = [CouponType.PERCENT, CouponType.FIXED] as const;

export class CouponItemDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: COUPON_TYPES, example: CouponType.PERCENT })
  @IsString()
  type!: (typeof COUPON_TYPES)[number];

  @ApiProperty({ example: 10, description: 'Percent (0-100) or fixed amount' })
  @IsNumber()
  value!: number;

  @ApiProperty({ example: '10% off for orders from $100' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  minimumOrderAmount!: number;

  @ApiPropertyOptional({ example: 50, nullable: true })
  @IsOptional()
  @IsNumber()
  maxDiscountAmount!: number | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @IsDate()
  startsAt!: Date;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z', nullable: true })
  @IsOptional()
  @IsDate()
  endsAt!: Date | null;
}

export class CouponListResponseDto {
  @ApiProperty({ type: CouponItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponItemDto)
  items!: CouponItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  pagination!: PaginationMetaDto;
}

export class ValidateCouponResponseDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: COUPON_TYPES, example: CouponType.PERCENT })
  @IsString()
  type!: (typeof COUPON_TYPES)[number];

  @ApiProperty({ example: 10 })
  @IsNumber()
  value!: number;

  @ApiProperty({ example: '10% off for orders from $100' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  minimumOrderAmount!: number;

  @ApiPropertyOptional({ example: 50, nullable: true })
  @IsOptional()
  @IsNumber()
  maxDiscountAmount!: number | null;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiProperty({
    example: 15,
    description: 'Discount applied, capped by subtotal',
  })
  @IsNumber()
  @Min(0)
  discount!: number;

  @ApiProperty({ example: 135, description: 'subtotal - discount' })
  @IsNumber()
  @Min(0)
  total!: number;
}
