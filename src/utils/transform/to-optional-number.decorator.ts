import { Transform } from 'class-transformer';
import { isEmptyQueryValue } from './query-transform.helpers.js';

export function ToOptionalNumber(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (isEmptyQueryValue(value)) {
      return undefined;
    }

    return Number(value);
  });
}
