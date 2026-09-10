import { ApiProperty } from '@nestjs/swagger';
import { CardBrand } from '../../../../../prisma/generated/prisma/enums.js';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
} from 'class-validator';

export class PaymentCardResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsString()
  id!: string;

  @ApiProperty({ example: 'VISA', enum: CardBrand })
  @IsEnum(CardBrand)
  brand!: CardBrand;

  @ApiProperty({ example: 'JOHN DOE' })
  @IsString()
  cardHolder!: string;

  @ApiProperty({ example: '4242' })
  @IsString()
  last4!: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  expiryMonth!: number;

  @ApiProperty({ example: 2030 })
  @IsInt()
  expiryYear!: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDefault!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  updatedAt!: Date;
}
