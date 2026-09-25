import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function parseWsPayload<T extends object>(
  dtoClass: new () => T,
  payload: unknown,
  bareValueField: keyof T,
): T {
  const raw =
    typeof payload === 'number' || typeof payload === 'string'
      ? { [bareValueField]: payload }
      : ((payload ?? {}) as Record<string, unknown>);

  const dto = plainToInstance(dtoClass, raw, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(dto);
  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new WsException(messages.join(', ') || 'Invalid payload');
  }

  return dto;
}
