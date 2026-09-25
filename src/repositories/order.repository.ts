import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';
import { clampLimit, normalizePagination } from '../utils/pagination/index.js';

export interface OrderListFilter {
  status?: Prisma.OrderWhereInput['status'];
  paymentStatus?: Prisma.OrderWhereInput['paymentStatus'];
  paymentMethod?: Prisma.OrderWhereInput['paymentMethod'];
  search?: string;
  userId?: string;
}

const orderItemInclude = {
  product: {
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  variant: true,
} satisfies Prisma.OrderItemInclude;

export type OrderItemWithRelations = Prisma.OrderItemGetPayload<{
  include: typeof orderItemInclude;
}>;

const orderWithItemsInclude = {
  items: {
    include: orderItemInclude,
    orderBy: { createdAt: 'asc' as const },
  },
  address: true,
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderWithItemsInclude;
}>;

const orderListInclude = {
  items: {
    include: orderItemInclude,
    orderBy: { createdAt: 'asc' as const },
  },
  address: true,
} satisfies Prisma.OrderInclude;

export type OrderListItem = Prisma.OrderGetPayload<{
  include: typeof orderListInclude;
}>;

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filter: OrderListFilter = {}): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (filter.userId !== undefined) {
      where.userId = filter.userId;
    }
    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.paymentStatus !== undefined) {
      where.paymentStatus = filter.paymentStatus;
    }
    if (filter.paymentMethod !== undefined) {
      where.paymentMethod = filter.paymentMethod;
    }
    if (filter.search) {
      const q = filter.search.trim();
      if (q) {
        where.OR = [
          { id: { contains: q, mode: 'insensitive' } },
          { couponCode: { contains: q, mode: 'insensitive' } },
          { note: { contains: q, mode: 'insensitive' } },
          { idempotencyKey: { contains: q, mode: 'insensitive' } },
        ];
      }
    }

    return where;
  }

  private buildListArgs(
    filter: OrderListFilter,
    limit?: number,
    skip?: number,
  ): Prisma.OrderFindManyArgs & { include: typeof orderListInclude } {
    return {
      where: this.buildWhere(filter),
      include: orderListInclude,
      orderBy: { createdAt: 'desc' },
      ...(limit !== undefined ? { take: limit } : {}),
      ...(skip !== undefined ? { skip } : {}),
    };
  }

  findById(orderId: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithItemsInclude,
    });
  }

  findByIdAndUserId(
    orderId: string,
    userId: string,
  ): Promise<OrderWithItems | null> {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderWithItemsInclude,
    });
  }

  findByIdempotencyKey(idempotencyKey: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({
      where: { idempotencyKey },
      include: orderWithItemsInclude,
    });
  }

  findByIdempotencyKeyAndUserId(
    idempotencyKey: string,
    userId: string,
  ): Promise<OrderWithItems | null> {
    return this.prisma.order.findFirst({
      where: { idempotencyKey, userId },
      include: orderWithItemsInclude,
    });
  }

  async findPaginatedByUserId(
    userId: string,
    filter: Omit<OrderListFilter, 'userId'> = {},
    page?: number,
    limit?: number,
  ): Promise<{ items: OrderListItem[]; total: number }> {
    const whereFilter: OrderListFilter = { ...filter, userId };
    const { limit: takeLimit, skip } = normalizePagination(page, limit);
    const where = this.buildWhere(whereFilter);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany(
        this.buildListArgs(whereFilter, takeLimit, skip),
      ) as unknown as Prisma.PrismaPromise<OrderListItem[]>,
      this.prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  async findPaginated(
    filter: OrderListFilter = {},
    page?: number,
    limit?: number,
  ): Promise<{ items: OrderListItem[]; total: number }> {
    const { limit: takeLimit, skip } = normalizePagination(page, limit);
    const where = this.buildWhere(filter);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany(
        this.buildListArgs(filter, takeLimit, skip),
      ) as unknown as Prisma.PrismaPromise<OrderListItem[]>,
      this.prisma.order.count({ where }),
    ]);
    return { items, total };
  }

  findByUserId(userId: string, limit = 20): Promise<OrderListItem[]> {
    return this.prisma.order.findMany(
      this.buildListArgs({ userId }, clampLimit(limit)),
    ) as unknown as Promise<OrderListItem[]>;
  }

  findRecentByUserId(userId: string, limit = 5): Promise<OrderListItem[]> {
    return this.findByUserId(userId, limit);
  }

  create(data: Prisma.OrderCreateInput): Promise<OrderWithItems> {
    return this.prisma.order.create({
      data,
      include: orderWithItemsInclude,
    });
  }

  createUnchecked(
    data: Prisma.OrderUncheckedCreateInput,
  ): Promise<OrderWithItems> {
    return this.prisma.order.create({
      data,
      include: orderWithItemsInclude,
    });
  }

  updateStatus(
    orderId: string,
    status: Prisma.OrderUpdateInput['status'],
  ): Promise<OrderWithItems> {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as never },
      include: orderWithItemsInclude,
    });
  }

  updatePaymentStatus(
    orderId: string,
    paymentStatus: Prisma.OrderUpdateInput['paymentStatus'],
  ): Promise<OrderWithItems> {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: paymentStatus as never },
      include: orderWithItemsInclude,
    });
  }

  update(
    orderId: string,
    data: Prisma.OrderUpdateInput,
  ): Promise<OrderWithItems> {
    return this.prisma.order.update({
      where: { id: orderId },
      data,
      include: orderWithItemsInclude,
    });
  }

  updateUnchecked(
    orderId: string,
    data: Prisma.OrderUncheckedUpdateInput,
  ): Promise<OrderWithItems> {
    return this.prisma.order.update({
      where: { id: orderId },
      data,
      include: orderWithItemsInclude,
    });
  }

  count(filter: OrderListFilter = {}): Promise<number> {
    return this.prisma.order.count({ where: this.buildWhere(filter) });
  }

  countByUserId(
    userId: string,
    filter: Omit<OrderListFilter, 'userId'> = {},
  ): Promise<number> {
    return this.count({ ...filter, userId });
  }

  delete(orderId: string): Promise<OrderWithItems> {
    return this.prisma.order.delete({
      where: { id: orderId },
      include: orderWithItemsInclude,
    });
  }

  findItemsByOrderId(orderId: string): Promise<OrderItemWithRelations[]> {
    return this.prisma.orderItem.findMany({
      where: { orderId },
      include: orderItemInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  findItemById(itemId: string): Promise<OrderItemWithRelations | null> {
    return this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: orderItemInclude,
    });
  }
}
