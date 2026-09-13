import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationMetaDto } from '../../../../dto/pagination.dto.js';

export class ReviewResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  productId!: number;

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

  @ApiProperty({ example: 'Great product!' })
  @IsString()
  comment!: string;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  @IsDate()
  createdAt!: Date;
}

export class ReviewListResponseDto {
  @ApiProperty({ type: ReviewResponseDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewResponseDto)
  items!: ReviewResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  pagination!: PaginationMetaDto;
}
