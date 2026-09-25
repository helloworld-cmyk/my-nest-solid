import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto.js';
import {
  ToBooleanQuery,
  ToNumberArray,
  ToOptionalNumber,
  ToStringArray,
  TrimToUndefined,
} from '../../../../utils/transform/index.js';

export const PRODUCT_LIST_SORTS = [
  'newest',
  'price_asc',
  'price_desc',
  'popular',
  'best_selling',
  'rating',
] as const;

export class ListProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'shirt' })
  @TrimToUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;

  @ApiPropertyOptional({ example: 'men' })
  @TrimToUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  categorySlug?: string;

  @ApiPropertyOptional({ example: 0 })
  @ToOptionalNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 999 })
  @ToOptionalNumber()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: [16140782], type: Number, isArray: true })
  @ToNumberArray()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  colors?: number[];

  @ApiPropertyOptional({ example: ['M', 'L'], type: String, isArray: true })
  @ToStringArray()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiPropertyOptional({ example: true })
  @ToBooleanQuery()
  @IsOptional()
  @IsBoolean()
  onSale?: boolean;

  @ApiPropertyOptional({ example: 'newest', enum: PRODUCT_LIST_SORTS })
  @IsOptional()
  @IsIn(PRODUCT_LIST_SORTS)
  sort?: (typeof PRODUCT_LIST_SORTS)[number];
}
