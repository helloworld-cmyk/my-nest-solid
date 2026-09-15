import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const reviewWithUserInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarPath: true,
    },
  },
} satisfies Prisma.ProductReviewInclude;

export type ReviewWithUser = Prisma.ProductReviewGetPayload<{
  include: typeof reviewWithUserInclude;
}>;

@Injectable()
export class ProductReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProductId(productId: number, page = 1, limit = 10) {
    const safePage = page > 0 ? Math.floor(page) : 1;
    const safeLimit = Math.min(Math.max(Math.floor(limit) || 10, 1), 100);
    return this.prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarPath: true,
          },
        },
      },
    });
  }

  countByProductId(productId: number) {
    return this.prisma.productReview.count({ where: { productId } });
  }

  findLatest(productId: number, limit = 3) {
    return this.prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 20),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarPath: true,
          },
        },
      },
    });
  }

  async getRatingStats(productId: number): Promise<{
    average: number;
    count: number;
  }> {
    const [agg, count] = await this.prisma.$transaction([
      this.prisma.productReview.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
      this.prisma.productReview.count({ where: { productId } }),
    ]);
    return {
      average: agg._avg.rating ? Number(agg._avg.rating) : 0,
      count,
    };
  }

  existsByProductAndUser(productId: number, userId: string) {
    return this.prisma.productReview.findFirst({
      where: { productId, userId },
      select: { id: true },
    });
  }

  create(data: Prisma.ProductReviewCreateInput) {
    return this.prisma.productReview.create({ data });
  }

  async createAndRecalcRating(
    data: Prisma.ProductReviewCreateInput,
  ): Promise<{ review: ReviewWithUser; average: number; count: number }> {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.productReview.create({
        data,
        include: reviewWithUserInclude,
      });

      const [agg, count] = await Promise.all([
        tx.productReview.aggregate({
          where: { productId: review.productId },
          _avg: { rating: true },
        }),
        tx.productReview.count({ where: { productId: review.productId } }),
      ]);
      const average = agg._avg.rating ? Number(agg._avg.rating) : 0;

      await tx.product.update({
        where: { id: review.productId },
        data: { ratingAvg: average, reviewCount: count },
      });

      return { review, average, count };
    });
  }
}
