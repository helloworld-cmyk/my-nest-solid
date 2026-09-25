import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, NotEquals } from 'class-validator';
import { parseWsPayload } from '../../../../utils/validation/parse-ws-payload.js';

export class SetIncrementDto {
  @ApiProperty({
    example: 5,
    description:
      'Integer added to the counter on every tick, replacing the default +1. Negative values count down.',
  })
  @Type(() => Number)
  @IsInt()
  @NotEquals(0)
  step!: number;

  @ApiPropertyOptional({
    example: 100,
    description:
      'Optional value to restart the sequence from: the next number emitted is this value, then this value + step.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  startFrom?: number;

  static parse(payload: unknown): SetIncrementDto {
    return parseWsPayload(SetIncrementDto, payload, 'step');
  }
}
