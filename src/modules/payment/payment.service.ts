import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client.js';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { PaymentCardRepository } from '../../repositories/payment-card.repository.js';
import { HashUtils } from '../../utils/crypto/index.js';
import { PaymentCardResponseMapper } from '../../utils/converDtoResponse/payment-card.js';
import {
  detectCardBrand,
  normalizeExpiryYear,
} from '../../utils/payment/index.js';
import { normalizeCardHolder } from '../../utils/string/index.js';
import { CreatePaymentCardRequestDto } from './dto/request/create-payment-card.js';
import { UpdatePaymentCardRequestDto } from './dto/request/update-payment-card.js';
import { PaymentCardResponseDto } from './dto/response/payment-card.js';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentCardRepository: PaymentCardRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async listCards(userId: string): Promise<PaymentCardResponseDto[]> {
    const cards =
      await this.paymentCardRepository.findAllActiveByUserId(userId);
    return PaymentCardResponseMapper.toPaymentCardResponses(cards);
  }

  async addCard(
    userId: string,
    dto: CreatePaymentCardRequestDto,
  ): Promise<PaymentCardResponseDto> {
    const { data } = dto;
    const cardToken = HashUtils.sha256(data.cardNumber);

    const existing = await this.paymentCardRepository.findActiveByTokenForUser(
      cardToken,
      userId,
    );
    if (existing) {
      throw new ConflictException(
        this.translator.t('payment.cardAlreadyExists'),
      );
    }

    if (data.isDefault) {
      await this.paymentCardRepository.unsetDefaultForUser(userId);
    }

    const card = await this.paymentCardRepository.create({
      user: { connect: { id: userId } },
      cardToken,
      brand: detectCardBrand(data.cardNumber),
      cardHolder: normalizeCardHolder(data.cardHolder),
      last4: data.cardNumber.slice(-4),
      expiryMonth: data.expiryMonth,
      expiryYear: normalizeExpiryYear(data.expiryYear),
      isDefault: data.isDefault ?? false,
    });
    return PaymentCardResponseMapper.toPaymentCardResponse(card);
  }

  async updateCard(
    userId: string,
    cardId: string,
    dto: UpdatePaymentCardRequestDto,
  ): Promise<PaymentCardResponseDto> {
    const { data } = dto;
    const existingCard = await this.paymentCardRepository.findActiveByIdAndUser(
      cardId,
      userId,
    );
    if (!existingCard) {
      throw new NotFoundException(this.translator.t('payment.cardNotFound'));
    }

    if (data.cardNumber) {
      const cardToken = HashUtils.sha256(data.cardNumber);
      const existing =
        await this.paymentCardRepository.findActiveByTokenForUser(
          cardToken,
          userId,
        );
      if (existing && existing.id !== cardId) {
        throw new ConflictException(
          this.translator.t('payment.cardAlreadyExists'),
        );
      }
    }

    if (data.isDefault) {
      await this.paymentCardRepository.unsetDefaultForUser(userId);
    }

    const updateData: Prisma.PaymentCardUpdateInput = {};

    if (data.cardNumber) {
      updateData.cardToken = HashUtils.sha256(data.cardNumber);
      updateData.brand = detectCardBrand(data.cardNumber);
      updateData.last4 = data.cardNumber.slice(-4);
    }

    if (data.cardHolder) {
      updateData.cardHolder = normalizeCardHolder(data.cardHolder);
    }

    if (data.expiryMonth !== undefined) {
      updateData.expiryMonth = data.expiryMonth;
    }

    if (data.expiryYear !== undefined) {
      updateData.expiryYear = normalizeExpiryYear(data.expiryYear);
    }

    if (data.isDefault !== undefined) {
      updateData.isDefault = data.isDefault;
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
      throw new NotFoundException(this.translator.t('payment.cardNotFound'));
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
      throw new NotFoundException(this.translator.t('payment.cardNotFound'));
    }

    await this.paymentCardRepository.unsetDefaultForUser(userId);
    const card = await this.paymentCardRepository.update(cardId, {
      isDefault: true,
    });
    return PaymentCardResponseMapper.toPaymentCardResponse(card);
  }
}
