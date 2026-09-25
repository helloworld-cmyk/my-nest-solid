import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../../../prisma/generated/prisma/enums.js';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto.js';
import { TrimToUndefined } from '../../../../utils/transform/index.js';

export const ORDER_STATUSES = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const;

export const ORDER_PAYMENT_STATUSES = [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
] as const;

export const ORDER_PAYMENT_METHODS = [
  PaymentMethod.COD,
  PaymentMethod.CARD,
] as const;

export class ListOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ORDER_STATUSES,
    example: OrderStatus.PENDING_PAYMENT,
  })
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];

  @ApiPropertyOptional({
    enum: ORDER_PAYMENT_STATUSES,
    example: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsIn(ORDER_PAYMENT_STATUSES)
  paymentStatus?: (typeof ORDER_PAYMENT_STATUSES)[number];

  @ApiPropertyOptional({
    enum: ORDER_PAYMENT_METHODS,
    example: PaymentMethod.COD,
  })
  @IsOptional()
  @IsIn(ORDER_PAYMENT_METHODS)
  paymentMethod?: (typeof ORDER_PAYMENT_METHODS)[number];

  @ApiPropertyOptional({
    example: 'SAVE10',
    description: 'Search by order ID, coupon code, note, or idempotency key',
  })
  @TrimToUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
