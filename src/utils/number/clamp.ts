export function toFlooredPositiveInt(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  const floored = Math.floor(value);
  return floored >= 1 ? floored : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function resolveIntervalMs(
  raw: string | number | undefined,
  defaultMs: number,
  minMs: number,
): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < minMs) {
    return defaultMs;
  }
  return Math.floor(parsed);
}
