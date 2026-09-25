import { CardBrand } from '../../../prisma/generated/prisma/enums.js';

export function normalizeExpiryYear(year: number): number {
  return year < 100 ? year + 2000 : year;
}

export function detectCardBrand(cardNumber: string): CardBrand {
  if (cardNumber.startsWith('4')) {
    return CardBrand.VISA;
  }
  if (/^5[1-5]/.test(cardNumber)) {
    return CardBrand.MASTERCARD;
  }
  if (cardNumber.startsWith('35')) {
    return CardBrand.JCB;
  }
  if (/^3[47]/.test(cardNumber)) {
    return CardBrand.AMEX;
  }
  return CardBrand.UNKNOWN;
}
