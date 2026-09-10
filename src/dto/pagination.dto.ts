import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  limit!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  total!: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  totalPages!: number;
}
