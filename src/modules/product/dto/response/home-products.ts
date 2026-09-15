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

export class HomeProductDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'printed-cotton-shirt' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Printed Cotton Shirt' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/products/shirt.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;

  @ApiProperty({ example: 45 })
  @IsNumber()
  price!: number;

  @ApiPropertyOptional({ example: 60, nullable: true })
  @IsOptional()
  @IsNumber()
  originalPrice!: number | null;

  @ApiProperty({ example: 358 })
  @IsInt()
  @Min(0)
  soldCount!: number;
}

export class HomeProductsResponseDto {
  @ApiProperty({ type: HomeProductDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeProductDto)
  hotDeals!: HomeProductDto[];

  @ApiProperty({ type: HomeProductDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeProductDto)
  newArrivals!: HomeProductDto[];

  @ApiProperty({ type: HomeProductDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeProductDto)
  onSale!: HomeProductDto[];
}
