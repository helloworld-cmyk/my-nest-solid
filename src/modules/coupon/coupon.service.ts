import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { CouponRepository } from '../../repositories/coupon.repository.js';
import { CouponResponseMapper } from '../../utils/converDtoResponse/coupon.js';
import { filterUsableCoupons } from '../../utils/coupon/index.js';
import { normalizePagination } from '../../utils/pagination/index.js';
import { normalizeCouponCode } from '../../utils/string/index.js';
import { ListCouponsQueryDto } from './dto/request/list-coupons.query.js';
import { ValidateCouponRequestDto } from './dto/request/validate-coupon.js';
import {
  CouponListResponseDto,
  ValidateCouponResponseDto,
} from './dto/response/coupon.js';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async listCoupons(
    query: ListCouponsQueryDto,
  ): Promise<CouponListResponseDto> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const coupons = await this.couponRepository.findActiveCoupons();
    const usable = filterUsableCoupons(coupons);

    const total = usable.length;
    const items = usable.slice(skip, skip + limit);
    return CouponResponseMapper.toCouponListResponse(
      items,
      page,
      limit,
      total,
      this.translator.currentLang,
    );
  }

  async validateCoupon(
    userId: string,
    dto: ValidateCouponRequestDto,
  ): Promise<ValidateCouponResponseDto> {
    const { data } = dto;
    const code = normalizeCouponCode(data.code);
    if (!code) {
      throw new BadRequestException(this.translator.t('coupon.codeRequired'));
    }

    const coupon = await this.couponRepository.findByCodeInsensitive(code);
    if (!coupon) {
      throw new NotFoundException(this.translator.t('coupon.notFound'));
    }

    const usedByUser =
      await this.couponRepository.countRedemptionsByUserAndCoupon(
        userId,
        coupon.id,
      );
    const now = new Date();
    if (!coupon.isActive) {
      throw new BadRequestException(this.translator.t('coupon.notActive'));
    }
    if (coupon.startsAt > now) {
      throw new BadRequestException(this.translator.t('coupon.notYetValid'));
    }
    if (coupon.endsAt && coupon.endsAt < now) {
      throw new BadRequestException(this.translator.t('coupon.expired'));
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException(
        this.translator.t('coupon.usageLimitReached'),
      );
    }
    if (usedByUser >= coupon.perUserLimit) {
      throw new BadRequestException(this.translator.t('coupon.alreadyUsed'));
    }
    const minimumOrderAmount = Number(coupon.minimumOrderAmount);
    if (data.subtotal < minimumOrderAmount) {
      throw new BadRequestException(
        this.translator.t('coupon.minimumOrderNotMet', {
          amount: minimumOrderAmount,
        }),
      );
    }

    const discount = CouponResponseMapper.computeDiscount(
      coupon,
      data.subtotal,
    );
    return CouponResponseMapper.toValidateResponse(
      coupon,
      data.subtotal,
      discount,
      this.translator.currentLang,
    );
  }
}
