import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const paymentCardResponseSelect = {
  id: true,
  brand: true,
  cardHolder: true,
  last4: true,
  expiryMonth: true,
  expiryYear: true,
  isDefault: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentCardSelect;

@Injectable()
export class PaymentCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PaymentCardCreateInput) {
    return this.prisma.paymentCard.create({
      data,
      select: paymentCardResponseSelect,
    });
  }

  findActiveByIdAndUser(id: string, userId: string) {
    return this.prisma.paymentCard.findFirst({
      where: { id, userId, isActive: true },
      select: { id: true },
    });
  }

  findDetailActiveByIdAndUser(id: string, userId: string) {
    return this.prisma.paymentCard.findFirst({
      where: { id, userId, isActive: true },
      select: {
        id: true,
        brand: true,
        last4: true,
        isDefault: true,
      },
    });
  }

  findActiveByTokenForUser(cardToken: string, userId: string) {
    return this.prisma.paymentCard.findFirst({
      where: { cardToken, userId, isActive: true },
      select: { id: true },
    });
  }

  findAllActiveByUserId(userId: string) {
    return this.prisma.paymentCard.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      select: paymentCardResponseSelect,
    });
  }

  findFirstActiveByUserId(userId: string) {
    return this.prisma.paymentCard.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
  }

  update(id: string, data: Prisma.PaymentCardUpdateInput) {
    return this.prisma.paymentCard.update({
      where: { id },
      data,
      select: paymentCardResponseSelect,
    });
  }

  delete(id: string) {
    return this.prisma.paymentCard.delete({
      where: { id },
      select: paymentCardResponseSelect,
    });
  }

  unsetDefaultForUser(userId: string) {
    return this.prisma.paymentCard.updateMany({
      where: { userId, isActive: true, isDefault: true },
      data: { isDefault: false },
    });
  }
}
