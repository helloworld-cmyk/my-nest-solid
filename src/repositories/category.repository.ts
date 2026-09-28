import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client.js';
import { PrismaService } from '../3rdparty/prisma/prisma.service.js';

const categoryInclude = {
  translations: true,
} satisfies Prisma.CategoryInclude;

export type CategoryWithTranslations = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.CategoryCreateInput, 'translations'> & {
      name: string;
      slug: string;
      languageCode: string;
    },
  ) {
    const { name, slug, languageCode, ...categoryData } = data;
    return this.prisma.category.create({
      data: {
        ...categoryData,
        translations: {
          create: {
            name,
            slug,
            languageCode,
          },
        },
      },
      include: categoryInclude,
    });
  }

  findAllActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: categoryInclude,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.category.findFirst({
      where: {
        translations: {
          some: { slug },
        },
      },
      include: categoryInclude,
    });
  }
}
