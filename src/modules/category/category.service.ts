import { ConflictException, Injectable } from '@nestjs/common';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { CategoryRepository } from '../../repositories/category.repository.js';
import { CategoryResponseMapper } from '../../utils/converDtoResponse/category.js';
import { CreateCategoryDto } from './dto/request/create-category.js';
import {
  CategoryListItemDto,
  CategoryResponseDto,
} from './dto/response/category.js';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async getCategories(): Promise<CategoryListItemDto[]> {
    const categories = await this.categoryRepository.findAllActive();
    const items = CategoryResponseMapper.toCategoryListItems(
      categories,
      this.translator.currentLang,
    );
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(
        this.translator.t('category.slugAlreadyExists', { slug: dto.slug }),
      );
    }

    const category = await this.categoryRepository.create({
      name: dto.name,
      slug: dto.slug,
      languageCode: this.translator.currentLang,
      imagePath: dto.imagePath,
      isActive: dto.isActive ?? true,
    });
    return CategoryResponseMapper.toCategoryResponse(
      category,
      this.translator.currentLang,
    );
  }
}
