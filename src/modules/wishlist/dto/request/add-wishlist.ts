import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddWishlistDto {
  @ApiProperty({ example: 1, description: 'ID of the product to wishlist' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  productId!: number;
}
