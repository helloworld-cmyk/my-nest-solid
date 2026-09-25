import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Great product!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment!: string;
}

export class CreateReviewRequestDto extends BaseRequestDto<CreateReviewDto> {
  @ApiProperty({ type: () => CreateReviewDto })
  @ValidateNested()
  @Type(() => CreateReviewDto)
  declare data: CreateReviewDto;
}
