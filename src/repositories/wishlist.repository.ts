import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';

const wishlistItemInclude = {
  product: {
    include: {
      category: { include: { translations: true } },
      images: { orderBy: { sortOrder: 'asc' as const } },
      translations: true,
    },
  },
} satisfies Prisma.WishlistItemInclude;

export type WishlistItemWithProduct = Prisma.WishlistItemGetPayload<{
  include: typeof wishlistItemInclude;
}>;

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProductIdsByUser(
    userId: string,
    productIds?: number[],
  ): Promise<number[]> {
    const rows = await this.prisma.wishlistItem.findMany({
      where: {
        userId,
        ...(productIds && productIds.length > 0
          ? { productId: { in: productIds } }
          : {}),
      },
      select: { productId: true },
    });
    return rows.map((r) => r.productId);
  }

  existsByUserAndProduct(userId: string, productId: number) {
    return this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });
  }

  findByUserAndProduct(
    userId: string,
    productId: number,
  ): Promise<WishlistItemWithProduct | null> {
    return this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
      include: wishlistItemInclude,
    });
  }

  listByUser(userId: string): Promise<WishlistItemWithProduct[]> {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: wishlistItemInclude,
    });
  }

  add(userId: string, productId: number) {
    return this.prisma.wishlistItem.create({ data: { userId, productId } });
  }

  remove(userId: string, productId: number) {
    return this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }
}
