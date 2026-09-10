import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CategoryListItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Men' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'men' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/categories/men.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;
}

export class CategoryResponseDto extends CategoryListItemDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  updatedAt!: Date;
}
