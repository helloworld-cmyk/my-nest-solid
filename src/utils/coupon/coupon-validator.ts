import type { CouponRow } from '../../repositories/coupon.repository.js';

export function isCouponUsable(
  coupon: CouponRow,
  now: Date = new Date(),
): boolean {
  if (!coupon.isActive) return false;
  if (coupon.startsAt > now) return false;
  if (coupon.endsAt && coupon.endsAt < now) return false;
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return false;
  return true;
}

export function filterUsableCoupons(
  coupons: CouponRow[],
  now: Date = new Date(),
): CouponRow[] {
  return coupons.filter((c) => isCouponUsable(c, now));
}
