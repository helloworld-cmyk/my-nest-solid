export function isEmptyQueryValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export function flattenQueryValues(value: unknown): unknown[] {
  const values: unknown[] = Array.isArray(value)
    ? (value as unknown[])
    : [value];

  return values.flatMap((entry): unknown[] => {
    if (typeof entry !== 'string' || !entry.includes(',')) {
      return [entry];
    }

    return entry.split(',').map((part) => part.trim());
  });
}
