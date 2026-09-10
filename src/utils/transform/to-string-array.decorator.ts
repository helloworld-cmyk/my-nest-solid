import { Transform } from 'class-transformer';
import {
  flattenQueryValues,
  isEmptyQueryValue,
} from './query-transform.helpers.js';

export function ToStringArray(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (isEmptyQueryValue(value)) {
      return undefined;
    }

    const values = flattenQueryValues(value).filter(
      (entry) => !isEmptyQueryValue(entry),
    );

    return values.map((entry) =>
      typeof entry === 'string' ? entry.trim() : entry,
    );
  });
}
