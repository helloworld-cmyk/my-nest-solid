import type { PaymentCardRepository } from '../../repositories/payment-card.repository.js';
import type { PaymentCardResponseDto } from '../../modules/payment/dto/response/payment-card.js';

type RepositoryCard = Awaited<
  ReturnType<PaymentCardRepository['findAllActiveByUserId']>
>[number];

export type PaymentCardData = RepositoryCard;
export type PaymentCardListData = Awaited<
  ReturnType<PaymentCardRepository['findAllActiveByUserId']>
>;

export class PaymentCardResponseMapper {
  private constructor() {}

  static toPaymentCardResponse(card: PaymentCardData): PaymentCardResponseDto {
    return {
      id: card.id,
      brand: card.brand,
      cardHolder: card.cardHolder,
      last4: card.last4,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      isDefault: card.isDefault,
      isActive: card.isActive,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  static toPaymentCardResponses(
    cards: PaymentCardListData,
  ): PaymentCardResponseDto[] {
    return cards.map((card) =>
      PaymentCardResponseMapper.toPaymentCardResponse(card),
    );
  }
}
