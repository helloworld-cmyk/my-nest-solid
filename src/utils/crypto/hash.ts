import { createHash } from 'node:crypto';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export class HashUtils {
  static sha256(value: string): string {
    return sha256(value);
  }
}
