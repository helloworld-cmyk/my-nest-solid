import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { SUPPORTED_LANGS } from '../../i18n/i18n.constants.js';
import type { SupportedLang } from '../../i18n/i18n.constants.js';

export class RequestMetadataDto {
  @ApiPropertyOptional({ enum: SUPPORTED_LANGS, example: 'vi' })
  @IsOptional()
  @IsIn(SUPPORTED_LANGS)
  lang?: SupportedLang;
}

export class BaseRequestDto<T> {
  @ApiPropertyOptional({ type: () => RequestMetadataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RequestMetadataDto)
  metadata?: RequestMetadataDto;

  @IsDefined()
  data!: T;
}
