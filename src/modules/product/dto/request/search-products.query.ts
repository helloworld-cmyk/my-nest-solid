import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto.js';
import { TrimToUndefined } from '../../../../utils/transform/index.js';

export class SearchProductsQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: 'shirt' })
  @TrimToUndefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  keyword!: string;
}
