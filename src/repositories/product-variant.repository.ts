import { Injectable } from '@nestjs/common';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';

@Injectable()
export class ProductVariantRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByProductId(productId: number) {
    return this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  findByProductAndOptions(
    productId: number,
    options: { colorHexCode?: number | null; size?: string | null },
  ) {
    return this.prisma.productVariant.findFirst({
      where: {
        productId,
        isActive: true,
        ...(options.colorHexCode !== undefined
          ? { colorHexCode: options.colorHexCode }
          : {}),
        ...(options.size !== undefined ? { size: options.size } : {}),
      },
    });
  }

  findSellableById(id: number) {
    return this.prisma.productVariant.findFirst({
      where: { id, isActive: true, product: { status: 'ACTIVE' } },
      include: { product: true },
    });
  }

  findSellableByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.productVariant.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { product: true },
    });
  }

  async decreaseStock(id: number, quantity: number): Promise<number> {
    const result = await this.prisma.productVariant.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return result.count;
  }

  increaseStock(id: number, quantity: number) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  }

  async getDistinctColors(productId?: number): Promise<number[]> {
    const rows = await this.prisma.productVariant.findMany({
      where: {
        isActive: true,
        colorHexCode: { not: null },
        ...(productId !== undefined ? { productId } : {}),
      },
      distinct: ['colorHexCode'],
      select: { colorHexCode: true },
    });
    return rows
      .map((r) => r.colorHexCode)
      .filter((c): c is number => c !== null);
  }

  async getDistinctSizes(productId?: number): Promise<string[]> {
    const rows = await this.prisma.productVariant.findMany({
      where: {
        isActive: true,
        size: { not: null },
        ...(productId !== undefined ? { productId } : {}),
      },
      distinct: ['size'],
      select: { size: true },
    });
    return rows.map((r) => r.size).filter((s): s is string => s !== null);
  }
}
