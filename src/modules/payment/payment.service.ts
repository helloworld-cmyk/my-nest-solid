import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardBrand } from '../../../prisma/generated/prisma/enums.js';
import { Prisma } from '../../../prisma/generated/prisma/client.js';
import { HashUtils } from '../../utils/class/hash.js';
import { PaymentCardRepository } from '../../repositories/payment-card.repository.js';
import { PaymentCardResponseMapper } from '../../utils/converDtoResponse/payment-card.js';
import { CreatePaymentCardDto } from './dto/request/create-payment-card.js';
import { UpdatePaymentCardDto } from './dto/request/update-payment-card.js';
import { PaymentCardResponseDto } from './dto/response/payment-card.js';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentCardRepository: PaymentCardRepository) {}

  async listCards(userId: string): Promise<PaymentCardResponseDto[]> {
    const cards =
      await this.paymentCardRepository.findAllActiveByUserId(userId);
    return PaymentCardResponseMapper.toPaymentCardResponses(cards);
  }

  async addCard(
    userId: string,
    dto: CreatePaymentCardDto,
  ): Promise<PaymentCardResponseDto> {
    const cardToken = HashUtils.sha256(dto.cardNumber);

    const existing = await this.paymentCardRepository.findActiveByTokenForUser(
      cardToken,
      userId,
    );
    if (existing) {
      throw new ConflictException('Card already exists');
    }

    if (dto.isDefault) {
      await this.paymentCardRepository.unsetDefaultForUser(userId);
    }

    const card = await this.paymentCardRepository.create({
      user: { connect: { id: userId } },
      cardToken,
      brand: this.detectBrand(dto.cardNumber),
      cardHolder: dto.cardHolder.trim().toUpperCase(),
      last4: dto.cardNumber.slice(-4),
      expiryMonth: dto.expiryMonth,
      expiryYear: this.normalizeExpiryYear(dto.expiryYear),
      isDefault: dto.isDefault ?? false,
    });
    return PaymentCardResponseMapper.toPaymentCardResponse(card);
  }

  async updateCard(
    userId: string,
    cardId: string,
    dto: UpdatePaymentCardDto,
  ): Promise<PaymentCardResponseDto> {
    const existingCard = await this.paymentCardRepository.findActiveByIdAndUser(
      cardId,
      userId,
    );
    if (!existingCard) {
      throw new NotFoundException('Payment card not found');
    }

    if (dto.cardNumber) {
      const cardToken = HashUtils.sha256(dto.cardNumber);
      const existing =
        await this.paymentCardRepository.findActiveByTokenForUser(
          cardToken,
          userId,
        );
      if (existing && existing.id !== cardId) {
        throw new ConflictException('Card already exists');
      }
    }

    if (dto.isDefault) {
      await this.paymentCardRepository.unsetDefaultForUser(userId);
    }

    const updateData: Prisma.PaymentCardUpdateInput = {};

    if (dto.cardNumber) {
      updateData.cardToken = HashUtils.sha256(dto.cardNumber);
      updateData.brand = this.detectBrand(dto.cardNumber);
      updateData.last4 = dto.cardNumber.slice(-4);
    }

    if (dto.cardHolder) {
      updateData.cardHolder = dto.cardHolder.trim().toUpperCase();
    }

    if (dto.expiryMonth !== undefined) {
      updateData.expiryMonth = dto.expiryMonth;
    }

    if (dto.expiryYear !== undefined) {
      updateData.expiryYear = this.normalizeExpiryYear(dto.expiryYear);
    }

    if (dto.isDefault !== undefined) {
      updateData.isDefault = dto.isDefault;
    }

    const card = await this.paymentCardRepository.update(cardId, updateData);
    return PaymentCardResponseMapper.toPaymentCardResponse(card);
  }

  async deleteCard(
    userId: string,
    cardId: string,
  ): Promise<PaymentCardResponseDto> {
    const existingCard = await this.paymentCardRepository.findActiveByIdAndUser(
      cardId,
      userId,
    );
    if (!existingCard) {
      throw new NotFoundException('Payment card not found');
    }

    const deleted = await this.paymentCardRepository.delete(cardId);

    if (deleted.isDefault) {
      const next =
        await this.paymentCardRepository.findFirstActiveByUserId(userId);
      if (next) {
        await this.paymentCardRepository.update(next.id, { isDefault: true });
      }
    }

    return PaymentCardResponseMapper.toPaymentCardResponse(deleted);
  }

  async setDefaultCard(
    userId: string,
    cardId: string,
  ): Promise<PaymentCardResponseDto> {
    const existingCard = await this.paymentCardRepository.findActiveByIdAndUser(
      cardId,
      userId,
    );
    if (!existingCard) {
      throw new NotFoundException('Payment card not found');
    }

    await this.paymentCardRepository.unsetDefaultForUser(userId);
    const card = await this.paymentCardRepository.update(cardId, {
      isDefault: true,
    });
    return PaymentCardResponseMapper.toPaymentCardResponse(card);
  }

  private normalizeExpiryYear(year: number): number {
    return year < 100 ? year + 2000 : year;
  }

  private detectBrand(cardNumber: string): CardBrand {
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
}
