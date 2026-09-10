import type { CategoryRepository } from '../../repositories/category.repository.js';
import type {
  CategoryListItemDto,
  CategoryResponseDto,
} from '../../modules/category/dto/response/category.js';

export type CategoryListItem = Awaited<
  ReturnType<CategoryRepository['findAllActive']>
>[number];
export type CategoryDetail = Awaited<ReturnType<CategoryRepository['create']>>;

export class CategoryResponseMapper {
  private constructor() {}

  static toCategoryListItem(category: CategoryListItem): CategoryListItemDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imagePath: category.imagePath,
    };
  }

  static toCategoryListItems(
    categories: CategoryListItem[],
  ): CategoryListItemDto[] {
    return categories.map((category) =>
      CategoryResponseMapper.toCategoryListItem(category),
    );
  }

  static toCategoryResponse(category: CategoryDetail): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imagePath: category.imagePath,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
