import { Transform } from 'class-transformer';
import {
  flattenQueryValues,
  isEmptyQueryValue,
} from './query-transform.helpers.js';

export function ToNumberArray(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (isEmptyQueryValue(value)) {
      return undefined;
    }

    const values = flattenQueryValues(value).filter(
      (entry) => !isEmptyQueryValue(entry),
    );

    return values.map((entry) => {
      if (typeof entry === 'number') {
        return Number.isFinite(entry) ? entry : entry;
      }

      if (typeof entry === 'string') {
        const parsed = Number(entry);
        return Number.isFinite(parsed) ? parsed : entry;
      }

      return entry;
    });
  });
}
