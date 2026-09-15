import { CouponType } from '../../../prisma/generated/prisma/enums.js';
import type { CouponRow } from '../../repositories/coupon.repository.js';
import type {
  CouponItemDto,
  CouponListResponseDto,
  ValidateCouponResponseDto,
} from '../../modules/coupon/dto/response/coupon.js';

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export class CouponResponseMapper {
  private constructor() {}

  static toCouponItem(coupon: CouponRow): CouponItemDto {
    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      description: coupon.description,
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maxDiscountAmount:
        coupon.maxDiscountAmount == null
          ? null
          : Number(coupon.maxDiscountAmount),
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
    };
  }

  static toCouponItems(coupons: CouponRow[]): CouponItemDto[] {
    return coupons.map((coupon) => CouponResponseMapper.toCouponItem(coupon));
  }

  static toCouponListResponse(
    coupons: CouponRow[],
    page: number,
    limit: number,
    total: number,
  ): CouponListResponseDto {
    return {
      items: CouponResponseMapper.toCouponItems(coupons),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
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
  ): ValidateCouponResponseDto {
    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      description: coupon.description,
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
