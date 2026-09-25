import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';

const cartItemRelationsInclude = {
  product: {
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  variant: true,
} satisfies Prisma.CartItemInclude;

export type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: typeof cartItemRelationsInclude;
}>;

const cartWithItemsInclude = {
  items: {
    include: cartItemRelationsInclude,
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartWithItemsInclude;
}>;

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: cartWithItemsInclude,
    });
  }

  getOrCreateByUserId(userId: string): Promise<CartWithItems> {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { user: { connect: { id: userId } } },
      update: {},
      include: cartWithItemsInclude,
    });
  }

  findItemByIdAndUser(
    itemId: string,
    userId: string,
  ): Promise<CartItemWithRelations | null> {
    return this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: cartItemRelationsInclude,
    });
  }

  findItemByCartProductVariant(
    cartId: string,
    productId: number,
    variantId: number,
  ): Promise<CartItemWithRelations | null> {
    return this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId,
      },
      include: cartItemRelationsInclude,
    });
  }

  createItem(
    cartId: string,
    productId: number,
    variantId: number,
    quantity: number,
  ) {
    return this.prisma.cartItem.create({
      data: { cartId, productId, variantId, quantity },
      include: cartItemRelationsInclude,
    });
  }

  updateItemQuantity(itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: cartItemRelationsInclude,
    });
  }

  deleteItem(itemId: string) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  clearByCartId(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
