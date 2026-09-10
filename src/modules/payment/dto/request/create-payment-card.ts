import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreatePaymentCardDto {
  @ApiProperty({
    example: '4111111111111111',
    description: 'Card number, 13-19 digits',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, {
    message: 'cardNumber must contain 13 to 19 digits',
  })
  cardNumber!: string;

  @ApiProperty({ example: 'JOHN DOE' })
  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth!: number;

  @ApiProperty({
    example: 2030,
    description: 'Expiry year, 2 or 4 digits (FE sends a 2-digit year)',
  })
  @IsInt()
  @Min(0)
  @Max(2100)
  expiryYear!: number;

  @ApiPropertyOptional({
    example: '123',
    description: 'CVV - used for validation only, never stored',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'cvv must contain 3 or 4 digits' })
  cvv?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
