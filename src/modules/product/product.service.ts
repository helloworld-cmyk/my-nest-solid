import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../../../prisma/generated/prisma/enums.js';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { CategoryRepository } from '../../repositories/category.repository.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductReviewRepository } from '../../repositories/product-review.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { ProductResponseMapper } from '../../utils/converDtoResponse/product.js';
import { ListProductsQueryDto } from './dto/request/list-products.query.js';
import { SearchProductsQueryDto } from './dto/request/search-products.query.js';
import { FilterOptionsResponseDto } from './dto/response/filter-options.js';
import { HomeProductsResponseDto } from './dto/response/home-products.js';
import {
  ProductDetailDto,
  RelatedProductDto,
} from './dto/response/product-detail.js';
import { ProductListResponseDto } from './dto/response/product-item.js';
import { SearchProductsResponseDto } from './dto/response/search-response.js';

const RELATED_LIMIT = 4;
const HOME_PRODUCTS_SIZE = 10;

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly productReviewRepository: ProductReviewRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async listProducts(
    query: ListProductsQueryDto,
  ): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'newest';
    const search = query.keyword;

    const { items, total } = await this.productRepository.findPaginated(
      {
        search,
        categorySlug: query.categorySlug,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        colorHexCodes: query.colors,
        sizes: query.sizes,
        onSaleOnly: query.onSale,
      },
      page,
      limit,
      sort,
    );

    return ProductResponseMapper.toProductListResponse(
      items,
      page,
      limit,
      total,
    );
  }

  async getHomeProducts(): Promise<HomeProductsResponseDto> {
    const feed =
      await this.productRepository.findHomeProducts(HOME_PRODUCTS_SIZE);

    return ProductResponseMapper.toHomeProductsResponse(feed);
  }

  async searchProducts(
    query: SearchProductsQueryDto,
  ): Promise<SearchProductsResponseDto> {
    const keyword = query.keyword;
    if (!keyword) {
      throw new BadRequestException(
        this.translator.t('product.keywordRequired'),
      );
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { items } = await this.productRepository.findPaginated(
      { search: keyword },
      page,
      limit,
      'newest',
    );

    return ProductResponseMapper.toSearchProductsResponse(keyword, items);
  }

  async getFilterOptions(): Promise<FilterOptionsResponseDto> {
    const [categories, colorValues, sizes, bounds] = await Promise.all([
      this.categoryRepository.findAllActive(),
      this.productVariantRepository.getDistinctColors(),
      this.productVariantRepository.getDistinctSizes(),
      this.productRepository.getPriceBounds(),
    ]);

    return ProductResponseMapper.toFilterOptionsResponse(
      categories,
      colorValues,
      sizes,
      bounds,
    );
  }

  async getProductDetail(slug: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(
        this.translator.t('product.slugNotFound', { slug }),
      );
    }

    const [related, latestReviews] = await Promise.all([
      this.productRepository.findRelated(
        product.categoryId,
        product.id,
        RELATED_LIMIT,
      ),
      this.productReviewRepository.findLatest(product.id, 3),
    ]);

    return ProductResponseMapper.toProductDetail(
      product,
      related,
      latestReviews,
    );
  }

  async getRelatedProducts(slug: string): Promise<RelatedProductDto[]> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(
        this.translator.t('product.slugNotFound', { slug }),
      );
    }

    const related = await this.productRepository.findRelated(
      product.categoryId,
      product.id,
      RELATED_LIMIT,
    );
    return ProductResponseMapper.toRelatedProducts(related);
  }
}
