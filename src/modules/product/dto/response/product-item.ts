import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationMetaDto } from '../../../../dto/pagination.dto.js';

export class ProductItemDto {
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

  @ApiPropertyOptional({
    example: 'https://example.com/products/shirt.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;
}

export class ProductListResponseDto {
  @ApiProperty({ type: ProductItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  items!: ProductItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  pagination!: PaginationMetaDto;
}
