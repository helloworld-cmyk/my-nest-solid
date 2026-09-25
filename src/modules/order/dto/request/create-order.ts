import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';
import { PaymentMethod } from '../../../../../prisma/generated/prisma/enums.js';
import { TrimToUndefined } from '../../../../utils/transform/index.js';
import { ORDER_PAYMENT_METHODS } from './list-orders.query.js';

export class CreateOrderDto {
  @ApiProperty({
    enum: ORDER_PAYMENT_METHODS,
    example: PaymentMethod.COD,
  })
  @IsIn(ORDER_PAYMENT_METHODS)
  paymentMethod!: (typeof ORDER_PAYMENT_METHODS)[number];

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  addressId!: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Saved card used when paymentMethod is CARD',
  })
  @IsOptional()
  @IsUUID()
  paymentCardId?: string;

  @ApiPropertyOptional({ example: 'SAVE10' })
  @TrimToUndefined()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  couponCode?: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description:
      'Client-generated key. Retrying with the same key returns the existing order.',
  })
  @IsUUID()
  idempotencyKey!: string;

  @ApiPropertyOptional({ example: 'Leave at the front door' })
  @TrimToUndefined()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note?: string;
}

export class CreateOrderRequestDto extends BaseRequestDto<CreateOrderDto> {
  @ApiProperty({ type: () => CreateOrderDto })
  @ValidateNested()
  @Type(() => CreateOrderDto)
  declare data: CreateOrderDto;
}
