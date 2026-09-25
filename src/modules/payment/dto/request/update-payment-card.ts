import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseRequestDto } from '../../../../common/dto/base-request.dto.js';

export class UpdatePaymentCardDto {
  @ApiPropertyOptional({
    example: '4111111111111111',
    description: 'Card number, 13-19 digits (re-derives brand/last4/token)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{13,19}$/, {
    message: 'cardNumber must contain 13 to 19 digits',
  })
  cardNumber?: string;

  @ApiPropertyOptional({ example: 'JOHN DOE' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cardHolder?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiPropertyOptional({
    example: 2030,
    description: 'Expiry year, 2 or 4 digits',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2100)
  expiryYear?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentCardRequestDto extends BaseRequestDto<UpdatePaymentCardDto> {
  @ApiPropertyOptional({ type: () => UpdatePaymentCardDto })
  @ValidateNested()
  @Type(() => UpdatePaymentCardDto)
  declare data: UpdatePaymentCardDto;
}
