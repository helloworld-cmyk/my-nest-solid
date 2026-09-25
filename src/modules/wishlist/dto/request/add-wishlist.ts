import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min, ValidateNested } from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class AddWishlistDto {
  @ApiProperty({ example: 1, description: 'ID of the product to wishlist' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  productId!: number;
}

export class AddWishlistRequestDto extends BaseRequestDto<AddWishlistDto> {
  @ApiProperty({ type: () => AddWishlistDto })
  @ValidateNested()
  @Type(() => AddWishlistDto)
  declare data: AddWishlistDto;
}
