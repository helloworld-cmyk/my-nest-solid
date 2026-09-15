import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponRepository } from '../../repositories/coupon.repository.js';
import { CouponResponseMapper } from '../../utils/converDtoResponse/coupon.js';
import { ListCouponsQueryDto } from './dto/request/list-coupons.query.js';
import { ValidateCouponDto } from './dto/request/validate-coupon.js';
import {
  CouponListResponseDto,
  ValidateCouponResponseDto,
} from './dto/response/coupon.js';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async listCoupons(
    query: ListCouponsQueryDto,
  ): Promise<CouponListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const coupons = await this.couponRepository.findActiveCoupons();
    const usable = coupons.filter(
      (coupon) =>
        coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit,
    );

    const total = usable.length;
    const items = usable.slice((page - 1) * limit, page * limit);
    return CouponResponseMapper.toCouponListResponse(items, page, limit, total);
  }

  async validateCoupon(
    userId: string,
    dto: ValidateCouponDto,
  ): Promise<ValidateCouponResponseDto> {
    const code = dto.code.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Coupon code is required');
    }

    const coupon = await this.couponRepository.findByCodeInsensitive(code);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    const now = new Date();
    if (coupon.startsAt > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.endsAt && coupon.endsAt < now) {
      throw new BadRequestException('Coupon has expired');
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const usedByUser =
      await this.couponRepository.countRedemptionsByUserAndCoupon(
        userId,
        coupon.id,
      );
    if (usedByUser >= coupon.perUserLimit) {
      throw new BadRequestException('You have already used this coupon');
    }

    const minimumOrderAmount = Number(coupon.minimumOrderAmount);
    if (dto.subtotal < minimumOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount of ${minimumOrderAmount} not met`,
      );
    }

    const discount = CouponResponseMapper.computeDiscount(coupon, dto.subtotal);
    return CouponResponseMapper.toValidateResponse(
      coupon,
      dto.subtotal,
      discount,
    );
  }
}
