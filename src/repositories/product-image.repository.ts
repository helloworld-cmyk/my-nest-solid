import { Injectable } from '@nestjs/common';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';

@Injectable()
export class ProductImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProductId(productId: number) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findGalleryByProductId(productId: number) {
    return this.prisma.productImage.findMany({
      where: {
        productId,
        type: 'GALLERY',
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findDetailByProductId(productId: number) {
    return this.prisma.productImage.findMany({
      where: {
        productId,
        type: 'DETAIL',
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findCoverByProductId(productId: number) {
    return this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
