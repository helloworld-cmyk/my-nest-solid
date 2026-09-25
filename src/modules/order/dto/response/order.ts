import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../../../prisma/generated/prisma/enums.js';
import { PaginationMetaDto } from '../../../../common/dto/pagination.dto.js';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id!: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  productId!: number | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  variantId!: number;

  @ApiPropertyOptional({ example: 'SKU-123', nullable: true })
  @IsOptional()
  @IsString()
  variantSku!: string | null;

  @ApiProperty({ example: 'Printed Cotton Shirt' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'https://example.com/products/shirt.png' })
  @IsString()
  imagePath!: string;

  @ApiPropertyOptional({ example: 16140745, nullable: true })
  @IsOptional()
  @IsInt()
  colorHexCode!: number | null;

  @ApiPropertyOptional({ example: 'M', nullable: true })
  @IsOptional()
  @IsString()
  size!: string | null;

  @ApiProperty({ example: 45, description: 'Unit price locked at checkout' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 90, description: 'unitPrice * quantity' })
  @IsNumber()
  @Min(0)
  lineTotal!: number;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  createdAt!: Date;
}

export class OrderAddressSnapshotDto {
  @ApiProperty({ example: 'Theresa Webb' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '(480) 555-0103' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({
    example: 'Willie.Jennings@example.com',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  email!: string | null;

  @ApiProperty({ example: '3517 W. Gray St. Utica, Pennsylvania 57867' })
  @IsString()
  address!: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING_PAYMENT })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  paymentCardId!: string | null;

  @ApiPropertyOptional({ example: '4242', nullable: true })
  @IsOptional()
  @IsString()
  paymentCardLast4!: string | null;

  @ApiPropertyOptional({ example: 'VISA', nullable: true })
  @IsOptional()
  @IsString()
  paymentCardBrand!: string | null;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  addressId!: string | null;

  @ApiProperty({ type: OrderAddressSnapshotDto })
  @ValidateNested()
  @Type(() => OrderAddressSnapshotDto)
  addressSnapshot!: OrderAddressSnapshotDto;

  @ApiProperty({ example: 135 })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  discount!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  shippingFee!: number;

  @ApiProperty({ example: 125 })
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @ApiPropertyOptional({ example: 'SAVE10', nullable: true })
  @IsOptional()
  @IsString()
  couponCode!: string | null;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  idempotencyKey!: string;

  @ApiPropertyOptional({ example: 'Leave at the front door', nullable: true })
  @IsOptional()
  @IsString()
  note!: string | null;

  @ApiProperty({ type: OrderItemResponseDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemResponseDto)
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  updatedAt!: Date;
}

export class OrderListResponseDto {
  @ApiProperty({ type: OrderResponseDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderResponseDto)
  items!: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  pagination!: PaginationMetaDto;
}
