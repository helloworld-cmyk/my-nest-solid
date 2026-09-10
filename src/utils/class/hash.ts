import { createHash } from 'node:crypto';

export class HashUtils {
  static sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
