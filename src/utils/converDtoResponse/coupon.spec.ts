import { CouponType } from '../../../prisma/generated/prisma/enums.js';
import type { CouponRow } from '../../repositories/coupon.repository.js';
import { CouponResponseMapper } from './coupon.js';

function makeCouponRow(
  translations: { languageCode: string; description: string }[],
): CouponRow {
  return {
    id: 'coupon-1',
    code: 'SAVE10',
    type: CouponType.PERCENT,
    value: 10,
    translations,
    minimumOrderAmount: 100,
    maxDiscountAmount: 50,
    usageLimit: null,
    usedCount: 0,
    perUserLimit: 1,
    startsAt: new Date('2026-01-01T00:00:00.000Z'),
    endsAt: null,
    isActive: true,
  } as unknown as CouponRow;
}

const TRANSLATIONS = [
  { languageCode: 'en', description: '10% off for orders from $100' },
  { languageCode: 'vi', description: 'Giảm 10% cho đơn từ $100' },
];

describe('CouponResponseMapper i18n', () => {
  it('returns the description of the requested language', () => {
    const dto = CouponResponseMapper.toCouponItem(
      makeCouponRow(TRANSLATIONS),
      'vi',
    );

    expect(dto.description).toBe('Giảm 10% cho đơn từ $100');
  });

  it('falls back to the default language when the requested one is missing', () => {
    const dto = CouponResponseMapper.toCouponItem(
      makeCouponRow(TRANSLATIONS),
      'ja',
    );

    expect(dto.description).toBe('10% off for orders from $100');
  });

  it('falls back to the first translation when requested and default are missing', () => {
    const dto = CouponResponseMapper.toCouponItem(
      makeCouponRow([{ languageCode: 'vi', description: 'Chỉ có tiếng Việt' }]),
      'ja',
    );

    expect(dto.description).toBe('Chỉ có tiếng Việt');
  });

  it('returns an empty description when the coupon has no translation', () => {
    const dto = CouponResponseMapper.toCouponItem(makeCouponRow([]));

    expect(dto.description).toBe('');
  });

  it('localizes every item of the list response', () => {
    const response = CouponResponseMapper.toCouponListResponse(
      [makeCouponRow(TRANSLATIONS)],
      1,
      20,
      1,
      'vi',
    );

    expect(response.items).toHaveLength(1);
    expect(response.items[0].description).toBe('Giảm 10% cho đơn từ $100');
    expect(response.pagination.total).toBe(1);
  });

  it('localizes the validate response and keeps the discount math', () => {
    const dto = CouponResponseMapper.toValidateResponse(
      makeCouponRow(TRANSLATIONS),
      200,
      20,
      'vi',
    );

    expect(dto.description).toBe('Giảm 10% cho đơn từ $100');
    expect(dto.total).toBe(180);
  });
});
