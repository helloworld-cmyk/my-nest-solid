import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Men' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'men' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/categories/men.png',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagePath!: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;
}
