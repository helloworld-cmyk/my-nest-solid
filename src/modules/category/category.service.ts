import { ConflictException, Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../repositories/category.repository.js';
import { CategoryResponseMapper } from '../../utils/converDtoResponse/category.js';
import { CreateCategoryDto } from './dto/request/create-category.js';
import {
  CategoryListItemDto,
  CategoryResponseDto,
} from './dto/response/category.js';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategories(): Promise<CategoryListItemDto[]> {
    const categories = await this.categoryRepository.findAllActive();
    return CategoryResponseMapper.toCategoryListItems(categories);
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(
        `Category with slug '${dto.slug}' already exists`,
      );
    }

    const category = await this.categoryRepository.create({
      name: dto.name,
      slug: dto.slug,
      imagePath: dto.imagePath,
      isActive: dto.isActive ?? true,
    });
    return CategoryResponseMapper.toCategoryResponse(category);
  }
}
