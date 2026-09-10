import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type ProductListSort =
  'newest' | 'price_asc' | 'price_desc' | 'popular' | 'best_selling' | 'rating';

export interface ProductListFilter {
  search?: string;
  categoryId?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  colorHexCodes?: number[];
  sizes?: string[];
  onSaleOnly?: boolean;
  status?: Prisma.ProductWhereInput['status'];
}

const productListInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.ProductInclude;

export type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

const productDetailInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { isActive: true },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.ProductInclude;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

function normalizePagination(page?: number, limit?: number) {
  const safePage = page && page > 0 ? Math.floor(page) : 1;
  const safeLimit = limit && limit > 0 ? Math.min(Math.floor(limit), 100) : 20;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhere(filter: ProductListFilter = {}): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      status: filter.status ?? 'ACTIVE',
    };

    if (filter.categoryId !== undefined) {
      where.categoryId = filter.categoryId;
    }
    if (filter.categorySlug !== undefined) {
      where.category = { slug: filter.categorySlug };
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.price = {
        ...(filter.minPrice !== undefined ? { gte: filter.minPrice } : {}),
        ...(filter.maxPrice !== undefined ? { lte: filter.maxPrice } : {}),
      };
    }

    if (filter.onSaleOnly) {
      where.originalPrice = { not: null };
    }

    if (filter.search) {
      const q = filter.search.trim();
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }
    }

    const hasColors =
      filter.colorHexCodes !== undefined && filter.colorHexCodes.length > 0;
    const hasSizes = filter.sizes !== undefined && filter.sizes.length > 0;
    if (hasColors || hasSizes) {
      where.variants = {
        some: {
          isActive: true,
          ...(hasColors ? { colorHexCode: { in: filter.colorHexCodes } } : {}),
          ...(hasSizes ? { size: { in: filter.sizes } } : {}),
        },
      };
    }

    return where;
  }

  resolveOrderBy(
    sort: ProductListSort = 'newest',
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'popular':
      case 'best_selling':
        return { soldCount: 'desc' };
      case 'rating':
        return { ratingAvg: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  async findPaginated(
    filter: ProductListFilter = {},
    page?: number,
    limit?: number,
    sort: ProductListSort = 'newest',
  ): Promise<{ items: ProductListItem[]; total: number }> {
    const { limit: take, skip } = normalizePagination(page, limit);
    const where = this.buildWhere(filter);
    const orderBy = this.resolveOrderBy(sort);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  count(filter: ProductListFilter = {}) {
    return this.prisma.product.count({ where: this.buildWhere(filter) });
  }

  findBySlug(slug: string): Promise<ProductDetail | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: productDetailInclude,
    });
  }

  findById(id: number): Promise<ProductDetail | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: productDetailInclude,
    });
  }

  findRelated(
    categoryId: number,
    excludeProductId: number,
    limit = 4,
  ): Promise<ProductListItem[]> {
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        categoryId,
        id: { not: excludeProductId },
      },
      include: productListInclude,
      orderBy: { soldCount: 'desc' },
      take: Math.min(Math.max(limit, 1), 20),
    });
  }

  findHotDeals(limit = 10): Promise<ProductListItem[]> {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: productListInclude,
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }

  findNewArrivals(limit = 10): Promise<ProductListItem[]> {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: productListInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  findOnSale(limit = 10): Promise<ProductListItem[]> {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', originalPrice: { not: null } },
      include: productListInclude,
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }

  /**
   * GET /products/home — 3 list home products, chạy trong 1 transaction.
   * hotDeals  = đang giảm giá (originalPrice > price), sort soldCount desc
   * newArrivals = sản phẩm mới, sort createdAt desc
   * onSale    = có originalPrice, sort soldCount desc
   */
  async findHomeProducts(listSize = 10): Promise<{
    hotDeals: ProductListItem[];
    newArrivals: ProductListItem[];
    onSale: ProductListItem[];
  }> {
    const take = Math.min(Math.max(listSize, 1), 20);
    const [hotDeals, newArrivals, onSale] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          originalPrice: { gt: this.prisma.product.fields.price },
        },
        include: productListInclude,
        orderBy: { soldCount: 'desc' },
        take,
      }),
      this.prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: productListInclude,
        orderBy: { createdAt: 'desc' },
        take,
      }),
      this.prisma.product.findMany({
        where: { status: 'ACTIVE', originalPrice: { not: null } },
        include: productListInclude,
        orderBy: { soldCount: 'desc' },
        take,
      }),
    ]);
    return { hotDeals, newArrivals, onSale };
  }

  async getPriceBounds(categoryId?: number): Promise<{
    min: number | null;
    max: number | null;
  }> {
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(categoryId !== undefined ? { categoryId } : {}),
    };
    const agg = await this.prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    });
    return {
      min: agg._min.price ? Number(agg._min.price) : null,
      max: agg._max.price ? Number(agg._max.price) : null,
    };
  }

  incrementSoldCount(id: number, quantity: number) {
    return this.prisma.product.update({
      where: { id },
      data: { soldCount: { increment: quantity } },
    });
  }

  updateRatingStats(id: number, ratingAvg: number, reviewCount: number) {
    return this.prisma.product.update({
      where: { id },
      data: { ratingAvg, reviewCount },
    });
  }

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }
}
