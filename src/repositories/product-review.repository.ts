import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';
import {
  clampLimit,
  DEFAULT_PAGE,
  normalizePagination,
} from '../utils/pagination/index.js';

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

const REVIEW_DEFAULT_LIMIT = 10;

@Injectable()
export class ProductReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProductId(
    productId: number,
    page = DEFAULT_PAGE,
    limit = REVIEW_DEFAULT_LIMIT,
  ) {
    const { limit: takeLimit, skip } = normalizePagination(page, limit, {
      defaultLimit: REVIEW_DEFAULT_LIMIT,
    });
    return this.prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: takeLimit,
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
      take: clampLimit(limit),
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
