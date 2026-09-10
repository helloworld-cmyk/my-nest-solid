export function isEmptyQueryValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export function flattenQueryValues(value: unknown): unknown[] {
  const values = Array.isArray(value) ? value : [value];

  return values.flatMap((entry) => {
    if (typeof entry !== 'string' || !entry.includes(',')) {
      return [entry];
    }

    return entry.split(',').map((part) => part.trim());
  });
}
