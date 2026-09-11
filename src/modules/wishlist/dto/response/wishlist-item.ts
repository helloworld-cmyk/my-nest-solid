import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class WishlistProductDto {
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

  @ApiProperty({ example: 4.8 })
  @IsNumber()
  ratingAvg!: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(0)
  reviewCount!: number;

  @ApiProperty({ example: 358 })
  @IsInt()
  @Min(0)
  soldCount!: number;
}

export class WishlistItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  productId!: number;

  @ApiProperty({ type: WishlistProductDto })
  @ValidateNested()
  product!: WishlistProductDto;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  createdAt!: Date;
}

export class WishlistListResponseDto {
  @ApiProperty({ type: WishlistItemResponseDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  items!: WishlistItemResponseDto[];
}
