import { CouponType } from '../../../prisma/generated/prisma/enums.js';
import type { CouponRow } from '../../repositories/coupon.repository.js';
import type {
  CouponItemDto,
  CouponListResponseDto,
  ValidateCouponResponseDto,
} from '../../modules/coupon/dto/response/coupon.js';
import { pickTranslation } from '../i18n/pick-translation.js';
import { roundMoney } from '../money/index.js';
import { buildPaginationMeta } from '../pagination/index.js';

export class CouponResponseMapper {
  private constructor() {}

  static toCouponItem(coupon: CouponRow, lang?: string): CouponItemDto {
    const translation = pickTranslation(coupon.translations, lang);
    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      description: translation?.description ?? '',
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maxDiscountAmount:
        coupon.maxDiscountAmount == null
          ? null
          : Number(coupon.maxDiscountAmount),
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
    };
  }

  static toCouponItems(coupons: CouponRow[], lang?: string): CouponItemDto[] {
    return coupons.map((coupon) =>
      CouponResponseMapper.toCouponItem(coupon, lang),
    );
  }

  static toCouponListResponse(
    coupons: CouponRow[],
    page: number,
    limit: number,
    total: number,
    lang?: string,
  ): CouponListResponseDto {
    return {
      items: CouponResponseMapper.toCouponItems(coupons, lang),
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static computeDiscount(coupon: CouponRow, subtotal: number): number {
    if (subtotal <= 0) {
      return 0;
    }
    const value = Number(coupon.value);
    const raw =
      coupon.type === CouponType.PERCENT ? (subtotal * value) / 100 : value;
    if (raw <= 0) {
      return 0;
    }
    const cappedByMax =
      coupon.maxDiscountAmount == null
        ? raw
        : Math.min(raw, Number(coupon.maxDiscountAmount));
    return roundMoney(Math.min(cappedByMax, subtotal));
  }

  static toValidateResponse(
    coupon: CouponRow,
    subtotal: number,
    discount: number,
    lang?: string,
  ): ValidateCouponResponseDto {
    const translation = pickTranslation(coupon.translations, lang);
    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      description: translation?.description ?? '',
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maxDiscountAmount:
        coupon.maxDiscountAmount == null
          ? null
          : Number(coupon.maxDiscountAmount),
      subtotal,
      discount,
      total: roundMoney(subtotal - discount),
    };
  }
}
