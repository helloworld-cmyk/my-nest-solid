import type { PaginationMetaDto } from '../../common/dto/pagination.dto.js';
import { toFlooredPositiveInt } from '../number/index.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const MAX_COLLECTION_LIMIT = 20;

export interface NormalizePaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
}

export function normalizePagination(
  page?: number,
  limit?: number,
  options: NormalizePaginationOptions = {},
): NormalizedPagination {
  const { defaultLimit = DEFAULT_PAGE_LIMIT, maxLimit = MAX_PAGE_LIMIT } =
    options;

  const safePage = toFlooredPositiveInt(page, DEFAULT_PAGE);
  const safeLimit = Math.min(
    toFlooredPositiveInt(limit, defaultLimit),
    maxLimit,
  );

  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export function clampLimit(
  limit: number,
  max: number = MAX_COLLECTION_LIMIT,
): number {
  const floored = Math.floor(limit);
  if (!Number.isFinite(floored)) {
    return max;
  }

  return Math.min(Math.max(floored, 1), max);
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMetaDto {
  return {
    page,
    limit,
    total,
    totalPages: total > 0 && limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
