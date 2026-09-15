import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductImageType } from '../../../../../prisma/generated/prisma/enums.js';

export class ProductImageDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'https://example.com/products/shirt-1.png' })
  @IsString()
  imagePath!: string;

  @ApiProperty({ enum: ProductImageType, example: ProductImageType.GALLERY })
  @IsEnum(ProductImageType)
  type!: ProductImageType;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class ProductVariantDto {
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

  @ApiPropertyOptional({ example: 45, nullable: true })
  @IsOptional()
  @IsNumber()
  price!: number | null;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class ReviewPreviewDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Theresa Webb' })
  @IsString()
  userName!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatars/user.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  avatarPath!: string | null;

  @ApiProperty({ example: 5 })
  @IsNumber()
  rating!: number;

  @ApiProperty({ example: 'Great!' })
  @IsString()
  comment!: string;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  createdAt!: Date;
}

export class RelatedProductDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'cotton-t-shirt' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Cotton T-Shirt' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 49 })
  @IsNumber()
  price!: number;

  @ApiPropertyOptional({
    example: 'https://example.com/products/t-shirt.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  soldCount!: number;
}

export class ProductDetailDto {
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

  @ApiProperty({ example: 'Short description...' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'Long description...', nullable: true })
  @IsOptional()
  @IsString()
  detailedDescription!: string | null;

  @ApiProperty({ type: ProductImageDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images!: ProductImageDto[];

  @ApiProperty({ type: ProductVariantDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];

  @ApiProperty({ type: ReviewPreviewDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewPreviewDto)
  reviews!: ReviewPreviewDto[];

  @ApiProperty({ type: RelatedProductDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedProductDto)
  relatedProducts!: RelatedProductDto[];
}
