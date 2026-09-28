import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';

const couponRowSelect = {
  id: true,
  code: true,
  type: true,
  value: true,
  translations: true,
  minimumOrderAmount: true,
  maxDiscountAmount: true,
  usageLimit: true,
  usedCount: true,
  perUserLimit: true,
  startsAt: true,
  endsAt: true,
  isActive: true,
} satisfies Prisma.CouponSelect;

export type CouponRow = Prisma.CouponGetPayload<{
  select: typeof couponRowSelect;
}>;

function activeWhere(now: Date): Prisma.CouponWhereInput {
  return {
    isActive: true,
    startsAt: { lte: now },
    OR: [{ endsAt: null }, { endsAt: { gte: now } }],
  };
}

@Injectable()
export class CouponRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveCoupons(now: Date = new Date()): Promise<CouponRow[]> {
    return this.prisma.coupon.findMany({
      where: activeWhere(now),
      orderBy: [{ endsAt: 'asc' }, { createdAt: 'desc' }],
      select: couponRowSelect,
    });
  }

  findByCodeInsensitive(code: string): Promise<CouponRow | null> {
    return this.prisma.coupon.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } },
      select: couponRowSelect,
    });
  }

  countRedemptionsByUserAndCoupon(
    userId: string,
    couponId: string,
  ): Promise<number> {
    return this.prisma.couponRedemption.count({
      where: { userId, couponId },
    });
  }
}
