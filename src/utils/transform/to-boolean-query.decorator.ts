import { Transform } from 'class-transformer';
import { isEmptyQueryValue } from './query-transform.helpers.js';

export function ToBooleanQuery(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (isEmptyQueryValue(value)) {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {
        return true;
      }
      if (normalized === 'false' || normalized === '0') {
        return false;
      }
    }

    if (typeof value === 'number' && (value === 0 || value === 1)) {
      return value === 1;
    }

    return value;
  });
}
