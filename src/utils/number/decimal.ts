export function toNumber(value: unknown): number {
  return Number(value);
}

export function toNullableNumber(value: unknown): number | null {
  return value == null ? null : Number(value);
}

export function toNumberOrDefault(value: unknown, fallback: number): number {
  if (value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
