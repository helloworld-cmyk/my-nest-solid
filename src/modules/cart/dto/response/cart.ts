import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartProductDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'printed-cotton-shirt' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Printed Cotton Shirt' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  price!: number;

  @ApiPropertyOptional({ example: 60, nullable: true })
  @IsOptional()
  @IsNumber()
  originalPrice!: number | null;

  @ApiProperty({ example: 'Shirts' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/products/shirt.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;
}

export class CartVariantDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiPropertyOptional({ example: 16140745, nullable: true })
  @IsOptional()
  @IsInt()
  colorHexCode!: number | null;

  @ApiPropertyOptional({ example: 'M', nullable: true })
  @IsOptional()
  @IsString()
  size!: string | null;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class CartItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  productId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  variantId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 45,
    description: 'Unit price (variant override or product price)',
  })
  @IsNumber()
  unitPrice!: number;

  @ApiProperty({ example: 90, description: 'unitPrice * quantity' })
  @IsNumber()
  totalPrice!: number;

  @ApiProperty({ type: CartProductDto })
  @ValidateNested()
  @Type(() => CartProductDto)
  product!: CartProductDto;

  @ApiProperty({ type: CartVariantDto })
  @ValidateNested()
  @Type(() => CartVariantDto)
  variant!: CartVariantDto;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  createdAt!: Date;
}

export class CartResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id!: string;

  @ApiProperty({ type: CartItemResponseDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemResponseDto)
  items!: CartItemResponseDto[];

  @ApiProperty({ example: 3, description: 'Sum of item quantities' })
  @IsInt()
  @Min(0)
  totalItems!: number;

  @ApiProperty({ example: 135, description: 'Sum of item totalPrice' })
  @IsNumber()
  @Min(0)
  subtotal!: number;
}
