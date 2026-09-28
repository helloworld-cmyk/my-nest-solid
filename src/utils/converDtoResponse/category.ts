import type {
  CategoryListItemDto,
  CategoryResponseDto,
} from '../../modules/category/dto/response/category.js';
import type { CategoryWithTranslations } from '../../repositories/category.repository.js';
import { pickTranslation } from '../i18n/pick-translation.js';

export type CategoryListItem = CategoryWithTranslations;
export type CategoryDetail = CategoryWithTranslations;

export class CategoryResponseMapper {
  private constructor() {}

  static toCategoryListItem(
    category: CategoryWithTranslations,
    lang?: string,
  ): CategoryListItemDto {
    const translation = pickTranslation(category.translations, lang);
    return {
      id: category.id,
      name: translation?.name ?? '',
      slug: translation?.slug ?? '',
      imagePath: category.imagePath,
    };
  }

  static toCategoryListItems(
    categories: CategoryWithTranslations[],
    lang?: string,
  ): CategoryListItemDto[] {
    return categories.map((category) =>
      CategoryResponseMapper.toCategoryListItem(category, lang),
    );
  }

  static toCategoryResponse(
    category: CategoryWithTranslations,
    lang?: string,
  ): CategoryResponseDto {
    const translation = pickTranslation(category.translations, lang);
    return {
      id: category.id,
      name: translation?.name ?? '',
      slug: translation?.slug ?? '',
      imagePath: category.imagePath,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
