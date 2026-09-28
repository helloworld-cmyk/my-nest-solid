import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
} from '../../../prisma/generated/prisma/enums.js';
import { Prisma } from '../../../prisma/generated/prisma/client.js';
import { CartRepository } from '../../repositories/cart.repository.js';
import { CouponRepository } from '../../repositories/coupon.repository.js';
import { OrderRepository } from '../../repositories/order.repository.js';
import { PaymentCardRepository } from '../../repositories/payment-card.repository.js';
import { UserAddressRepository } from '../../repositories/user-address.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { CouponResponseMapper } from '../../utils/converDtoResponse/coupon.js';
import { OrderResponseMapper } from '../../utils/converDtoResponse/order.js';
import { roundMoney } from '../../utils/money/index.js';
import { pickCoverImageOrEmpty } from '../../utils/media/index.js';
import { resolveUnitPrice } from '../../utils/price/index.js';
import { normalizeCouponCode } from '../../utils/string/index.js';
import { pickTranslation } from '../../utils/i18n/pick-translation.js';
import { PrismaService } from '../../3rdparty/prisma/prisma.service.js';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { CreateOrderRequestDto } from './dto/request/create-order.js';
import { ListOrdersQueryDto } from './dto/request/list-orders.query.js';
import {
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/response/order.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly userAddressRepository: UserAddressRepository,
    private readonly paymentCardRepository: PaymentCardRepository,
    private readonly couponRepository: CouponRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly prisma: PrismaService,
    private readonly translator: I18nTranslator,
  ) {}

  async createOrder(
    userId: string,
    dto: CreateOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const { data } = dto;
    const existingByKey = await this.orderRepository.findByIdempotencyKey(
      data.idempotencyKey,
    );
    if (existingByKey) {
      if (existingByKey.userId !== userId) {
        throw new ConflictException(
          this.translator.t('order.idempotencyKeyUsed'),
        );
      }
      return OrderResponseMapper.toOrderResponse(existingByKey);
    }

    const address = await this.userAddressRepository.findDetailByIdAndUser(
      data.addressId,
      userId,
    );
    if (!address) {
      throw new NotFoundException(this.translator.t('order.addressNotFound'));
    }

    let paymentCardLast4: string | null = null;
    let paymentCardBrand: string | null = null;
    if (data.paymentMethod === PaymentMethod.CARD) {
      if (!data.paymentCardId) {
        throw new BadRequestException(
          this.translator.t('order.paymentCardIdRequired'),
        );
      }
      const card = await this.paymentCardRepository.findDetailActiveByIdAndUser(
        data.paymentCardId,
        userId,
      );
      if (!card) {
        throw new NotFoundException(
          this.translator.t('order.paymentCardNotFound'),
        );
      }
      paymentCardLast4 = card.last4;
      paymentCardBrand = card.brand;
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException(this.translator.t('order.cartEmpty'));
    }

    for (const item of cart.items) {
      if (!item.variant) {
        throw new BadRequestException(
          this.translator.t('order.itemMissingVariant'),
        );
      }
      if (!item.variant.isActive) {
        throw new BadRequestException(
          this.translator.t('order.variantNotAvailable'),
        );
      }
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(
          this.translator.t('order.notEnoughStock'),
        );
      }
    }

    let subtotal = 0;
    for (const item of cart.items) {
      const unitPrice = resolveUnitPrice(item.product, item.variant);
      subtotal += unitPrice * item.quantity;
    }
    subtotal = roundMoney(subtotal);

    let discount = 0;
    let couponCode: string | null = null;
    let couponId: string | null = null;
    if (data.couponCode) {
      const code = normalizeCouponCode(data.couponCode);
      const coupon = await this.couponRepository.findByCodeInsensitive(code);
      if (!coupon) {
        throw new NotFoundException(this.translator.t('order.couponNotFound'));
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
      if (subtotal < minimumOrderAmount) {
        throw new BadRequestException(
          this.translator.t('coupon.minimumOrderNotMet', {
            amount: minimumOrderAmount,
          }),
        );
      }
      discount = CouponResponseMapper.computeDiscount(coupon, subtotal);
      couponCode = coupon.code;
      couponId = coupon.id;
    }

    const shippingFee = 0;
    const totalAmount = roundMoney(subtotal - discount + shippingFee);

    const addressSnapshot = {
      name: address.name,
      phone: address.phone,
      email: address.email,
      address: address.address,
    };

    const orderItemsCreate = cart.items.map((item) => {
      const unitPrice = resolveUnitPrice(item.product, item.variant);
      return {
        productId: item.productId,
        variantId: item.variantId,
        variantSku: (item.variant as { sku?: string | null }).sku ?? null,
        name:
          pickTranslation(
            item.product.translations,
            this.translator.currentLang,
          )?.name ?? '',
        imagePath: pickCoverImageOrEmpty(
          (item.product as { images?: { imagePath: string; type: string }[] })
            .images ?? [],
        ),
        colorHexCode: item.variant.colorHexCode,
        size: item.variant.size,
        unitPrice,
        quantity: item.quantity,
        lineTotal: roundMoney(unitPrice * item.quantity),
      };
    });

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        for (const item of cart.items) {
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new BadRequestException(
              this.translator.t('order.notEnoughStock'),
            );
          }
        }

        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.PENDING_PAYMENT,
            paymentMethod: data.paymentMethod,
            paymentCardId: data.paymentCardId ?? null,
            paymentCardLast4,
            paymentCardBrand,
            addressId: data.addressId,
            addressSnapshot,
            subtotal,
            discount,
            shippingFee,
            totalAmount,
            couponId,
            couponCode,
            idempotencyKey: data.idempotencyKey,
            note: data.note ?? null,
            items: {
              create: orderItemsCreate,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                    images: { orderBy: { sortOrder: 'asc' as const } },
                  },
                },
                variant: true,
              },
              orderBy: { createdAt: 'asc' as const },
            },
            address: true,
          },
        });

        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
          });
          await tx.couponRedemption.create({
            data: {
              userId,
              couponId,
              orderId: order.id,
              discountApplied: discount,
            },
          });
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order;
      });

      const full = await this.orderRepository.findById(
        (created as { id: string }).id,
      );
      if (!full) {
        throw new NotFoundException(
          this.translator.t('order.orderNotFoundAfterCreation'),
        );
      }
      return OrderResponseMapper.toOrderResponse(full);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const retry = await this.orderRepository.findByIdempotencyKey(
          data.idempotencyKey,
        );
        if (retry) {
          if (retry.userId !== userId) {
            throw new ConflictException(
              this.translator.t('order.idempotencyKeyUsed'),
            );
          }
          return OrderResponseMapper.toOrderResponse(retry);
        }
        throw new ConflictException(
          this.translator.t('order.idempotencyKeyUsed'),
        );
      }
      throw error;
    }
  }

  async listOrders(
    userId: string,
    query: ListOrdersQueryDto,
  ): Promise<OrderListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.orderRepository.findPaginatedByUserId(
      userId,
      {
        status: query.status,
        paymentStatus: query.paymentStatus,
        paymentMethod: query.paymentMethod,
        search: query.search,
      },
      page,
      limit,
    );

    return OrderResponseMapper.toOrderListResponse(items, page, limit, total);
  }

  async getOrder(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdAndUserId(orderId, userId);
    if (!order) {
      throw new NotFoundException(this.translator.t('order.orderNotFound'));
    }
    return OrderResponseMapper.toOrderResponse(order);
  }

  async cancelOrder(
    userId: string,
    orderId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdAndUserId(orderId, userId);
    if (!order) {
      throw new NotFoundException(this.translator.t('order.orderNotFound'));
    }
    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.REFUNDED
    ) {
      throw new ConflictException(this.translator.t('order.cannotCancel'));
    }
    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new ConflictException(this.translator.t('order.cannotCancel'));
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      const next = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  images: { orderBy: { sortOrder: 'asc' as const } },
                },
              },
              variant: true,
            },
            orderBy: { createdAt: 'asc' as const },
          },
          address: true,
        },
      });
      return next;
    });

    const full = await this.orderRepository.findById(orderId);
    if (!full) {
      return OrderResponseMapper.toOrderResponse(updated);
    }
    return OrderResponseMapper.toOrderResponse(full);
  }
}
