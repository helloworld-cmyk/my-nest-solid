import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 1, description: 'ID of the product to add' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({
    example: 1,
    description:
      'ID of the product variant (color/size). Required whenever productId is sent.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  variantId!: number;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Quantity to add',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;
}
