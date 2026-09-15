import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SearchProductItemDto {
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

  @ApiPropertyOptional({
    example: 'https://example.com/products/shirt.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;

  @ApiProperty({ example: 'Shirts' })
  @IsString()
  type!: string;
}

export class SearchProductsResponseDto {
  @ApiProperty({ example: 'shirt' })
  @IsString()
  query!: string;

  @ApiProperty({ example: ['Shoes', 'Shirts'], type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  filterCategories!: string[];

  @ApiProperty({ type: SearchProductItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SearchProductItemDto)
  products!: SearchProductItemDto[];
}
