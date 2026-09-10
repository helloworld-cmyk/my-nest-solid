import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Phục vụ `isInWishlist` ở GET /catalog/products và các wishlist endpoints sau này.
 */
@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách productId user đã wishlist (tuỳ chọn giới hạn trong 1 tập product) */
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

  listByUser(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
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
