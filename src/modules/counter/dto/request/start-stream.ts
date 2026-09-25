import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { parseWsPayload } from '../../../../utils/validation/parse-ws-payload.js';

export class StartStreamDto {
  @ApiPropertyOptional({
    example: 100,
    description:
      'Value that the restarted sequence starts from. When omitted, the stream resumes at its current position.',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  startFrom?: number;

  static parse(payload: unknown): StartStreamDto {
    return parseWsPayload(StartStreamDto, payload, 'startFrom');
  }
}
