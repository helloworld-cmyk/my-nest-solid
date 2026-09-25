import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

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

export class AddCartItemRequestDto extends BaseRequestDto<AddCartItemDto> {
  @ApiProperty({ type: () => AddCartItemDto })
  @ValidateNested()
  @Type(() => AddCartItemDto)
  declare data: AddCartItemDto;
}
