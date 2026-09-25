import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'New quantity for the cart item' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class UpdateCartItemRequestDto extends BaseRequestDto<UpdateCartItemDto> {
  @ApiProperty({ type: () => UpdateCartItemDto })
  @ValidateNested()
  @Type(() => UpdateCartItemDto)
  declare data: UpdateCartItemDto;
}
