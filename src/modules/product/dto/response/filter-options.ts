import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CategoryGroupDto {
  @ApiProperty({ example: 'Men' })
  @IsString()
  title!: string;

  @ApiProperty({ example: [], type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  items!: string[];
}

export class FilterOptionsResponseDto {
  @ApiProperty({ type: CategoryGroupDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryGroupDto)
  categoryGroups!: CategoryGroupDto[];

  @ApiProperty({ example: [16140782, 16039951], type: Number, isArray: true })
  @IsArray()
  @IsInt({ each: true })
  colorValues!: number[];

  @ApiProperty({ example: ['S', 'M', 'L', 'XL'], type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  sizes!: string[];

  @ApiProperty({ example: 0 })
  @IsNumber()
  minPrice!: number;

  @ApiProperty({ example: 999 })
  @IsNumber()
  maxPrice!: number;
}
