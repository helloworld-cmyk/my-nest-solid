import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const categoryListItemSelect = {
  id: true,
  name: true,
  slug: true,
  imagePath: true,
} satisfies Prisma.CategorySelect;

const categoryDetailSelect = {
  id: true,
  name: true,
  slug: true,
  imagePath: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data, select: categoryDetailSelect });
  }

  findAllActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: categoryListItemSelect,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
  }
}
