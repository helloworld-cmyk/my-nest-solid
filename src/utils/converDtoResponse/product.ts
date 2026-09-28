import type { CategoryRepository } from '../../repositories/category.repository.js';
import type {
  ProductDetail,
  ProductListItem,
  ProductRepository,
} from '../../repositories/product.repository.js';
import type { ReviewWithUser } from '../../repositories/product-review.repository.js';
import type {
  CategoryGroupDto,
  FilterOptionsResponseDto,
} from '../../modules/product/dto/response/filter-options.js';
import type {
  HomeProductsResponseDto,
  HomeProductDto,
} from '../../modules/product/dto/response/home-products.js';
import type {
  ProductDetailDto,
  ProductImageDto,
  ProductVariantDto,
  RelatedProductDto,
  ReviewPreviewDto,
} from '../../modules/product/dto/response/product-detail.js';
import type {
  ProductItemDto,
  ProductListResponseDto,
} from '../../modules/product/dto/response/product-item.js';
import type {
  SearchProductItemDto,
  SearchProductsResponseDto,
} from '../../modules/product/dto/response/search-response.js';
import { buildPaginationMeta } from '../pagination/index.js';
import {
  pickCoverImage as pickCoverImageUtil,
  type CoverImageInput,
} from '../media/index.js';
import { pickTranslation } from '../i18n/pick-translation.js';

export type CategoryListItem = Awaited<
  ReturnType<CategoryRepository['findAllActive']>
>[number];
export type HomeProducts = Awaited<
  ReturnType<ProductRepository['findHomeProducts']>
>;
export type PriceBounds = Awaited<
  ReturnType<ProductRepository['getPriceBounds']>
>;

export type { CoverImageInput };

export class ProductResponseMapper {
  private constructor() {}

  static pickCoverImage(images: readonly CoverImageInput[]): string | null {
    return pickCoverImageUtil(images);
  }

  static toProductItem(item: ProductListItem, lang?: string): ProductItemDto {
    const translation = pickTranslation(item.translations, lang);
    return {
      id: item.id,
      slug: translation?.slug ?? '',
      name: translation?.name ?? '',
      price: Number(item.price),
      originalPrice:
        item.originalPrice == null ? null : Number(item.originalPrice),
      ratingAvg: Number(item.ratingAvg),
      reviewCount: item.reviewCount,
      soldCount: item.soldCount,
      imagePath: ProductResponseMapper.pickCoverImage(item.images),
    };
  }

  static toProductItems(
    items: ProductListItem[],
    lang?: string,
  ): ProductItemDto[] {
    return items.map((item) => ProductResponseMapper.toProductItem(item, lang));
  }

  static toProductListResponse(
    items: ProductListItem[],
    page: number,
    limit: number,
    total: number,
    lang?: string,
  ): ProductListResponseDto {
    return {
      items: ProductResponseMapper.toProductItems(items, lang),
      pagination: buildPaginationMeta(page, limit, total),
    };
  }

  static toHomeProduct(item: ProductListItem, lang?: string): HomeProductDto {
    const translation = pickTranslation(item.translations, lang);
    return {
      id: item.id,
      slug: translation?.slug ?? '',
      name: translation?.name ?? '',
      imagePath: ProductResponseMapper.pickCoverImage(item.images),
      price: Number(item.price),
      originalPrice:
        item.originalPrice == null ? null : Number(item.originalPrice),
      soldCount: item.soldCount,
    };
  }

  static toHomeProducts(
    items: ProductListItem[],
    lang?: string,
  ): HomeProductDto[] {
    return items.map((item) => ProductResponseMapper.toHomeProduct(item, lang));
  }

  static toHomeProductsResponse(
    feed: HomeProducts,
    lang?: string,
  ): HomeProductsResponseDto {
    return {
      hotDeals: ProductResponseMapper.toHomeProducts(feed.hotDeals, lang),
      newArrivals: ProductResponseMapper.toHomeProducts(feed.newArrivals, lang),
      onSale: ProductResponseMapper.toHomeProducts(feed.onSale, lang),
    };
  }

  static toReviewPreview(review: ReviewWithUser): ReviewPreviewDto {
    return {
      id: review.id,
      userName: review.userName,
      avatarPath: review.avatarPath ?? review.user?.avatarPath ?? null,
      rating: Number(review.rating),
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  static toReviewPreviews(reviews: ReviewWithUser[]): ReviewPreviewDto[] {
    return reviews.map((review) =>
      ProductResponseMapper.toReviewPreview(review),
    );
  }

  static toRelatedProduct(
    item: ProductListItem,
    lang?: string,
  ): RelatedProductDto {
    const translation = pickTranslation(item.translations, lang);
    return {
      id: item.id,
      slug: translation?.slug ?? '',
      name: translation?.name ?? '',
      price: Number(item.price),
      imagePath: ProductResponseMapper.pickCoverImage(item.images),
      soldCount: item.soldCount,
    };
  }

  static toRelatedProducts(
    items: ProductListItem[],
    lang?: string,
  ): RelatedProductDto[] {
    return items.map((item) =>
      ProductResponseMapper.toRelatedProduct(item, lang),
    );
  }

  static toSearchProductItem(
    item: ProductListItem,
    lang?: string,
  ): SearchProductItemDto {
    const translation = pickTranslation(item.translations, lang);
    const categoryTranslation = pickTranslation(
      item.category.translations,
      lang,
    );
    return {
      id: item.id,
      slug: translation?.slug ?? '',
      name: translation?.name ?? '',
      price: Number(item.price),
      originalPrice:
        item.originalPrice == null ? null : Number(item.originalPrice),
      imagePath: ProductResponseMapper.pickCoverImage(item.images),
      type: categoryTranslation?.name ?? '',
    };
  }

  static toSearchProducts(
    items: ProductListItem[],
    lang?: string,
  ): SearchProductItemDto[] {
    return items.map((item) =>
      ProductResponseMapper.toSearchProductItem(item, lang),
    );
  }

  static toFilterCategories(items: ProductListItem[], lang?: string): string[] {
    return [
      ...new Set(
        items.map(
          (item) =>
            pickTranslation(item.category.translations, lang)?.name ?? '',
        ),
      ),
    ].sort();
  }

  static toSearchProductsResponse(
    keyword: string,
    items: ProductListItem[],
    lang?: string,
  ): SearchProductsResponseDto {
    return {
      query: keyword,
      filterCategories: ProductResponseMapper.toFilterCategories(items, lang),
      products: ProductResponseMapper.toSearchProducts(items, lang),
    };
  }

  static toCategoryGroup(
    category: CategoryListItem,
    lang?: string,
  ): CategoryGroupDto {
    return {
      // Chưa có SubCategory/tag nên items để rỗng, mở rộng khi schema thêm.
      title: pickTranslation(category.translations, lang)?.name ?? '',
      items: [],
    };
  }

  static toCategoryGroups(
    categories: CategoryListItem[],
    lang?: string,
  ): CategoryGroupDto[] {
    return categories.map((category) =>
      ProductResponseMapper.toCategoryGroup(category, lang),
    );
  }

  static toFilterOptionsResponse(
    categories: CategoryListItem[],
    colorValues: number[],
    sizes: string[],
    bounds: PriceBounds,
    lang?: string,
  ): FilterOptionsResponseDto {
    return {
      categoryGroups: ProductResponseMapper.toCategoryGroups(categories, lang),
      colorValues,
      sizes,
      minPrice: bounds.min ?? 0,
      maxPrice: bounds.max ?? 0,
    };
  }

  static toProductImage(
    image: ProductDetail['images'][number],
  ): ProductImageDto {
    return {
      id: image.id,
      imagePath: image.imagePath,
      type: image.type,
      sortOrder: image.sortOrder,
    };
  }

  static toProductImages(images: ProductDetail['images']): ProductImageDto[] {
    return images.map((image) => ProductResponseMapper.toProductImage(image));
  }

  static toProductVariant(
    variant: ProductDetail['variants'][number],
  ): ProductVariantDto {
    return {
      id: variant.id,
      colorHexCode: variant.colorHexCode,
      size: variant.size,
      price: variant.price == null ? null : Number(variant.price),
      stock: variant.stock,
      isActive: variant.isActive,
    };
  }

  static toProductVariants(
    variants: ProductDetail['variants'],
  ): ProductVariantDto[] {
    return variants.map((variant) =>
      ProductResponseMapper.toProductVariant(variant),
    );
  }

  static toProductDetail(
    product: ProductDetail,
    related: ProductListItem[],
    latestReviews: ReviewWithUser[],
    lang?: string,
  ): ProductDetailDto {
    const translation = pickTranslation(product.translations, lang);
    return {
      id: product.id,
      slug: translation?.slug ?? '',
      name: translation?.name ?? '',
      price: Number(product.price),
      originalPrice:
        product.originalPrice == null ? null : Number(product.originalPrice),
      ratingAvg: Number(product.ratingAvg),
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
      description: translation?.description ?? '',
      detailedDescription: translation?.detailedDescription ?? null,
      images: ProductResponseMapper.toProductImages(product.images),
      variants: ProductResponseMapper.toProductVariants(product.variants),
      reviews: ProductResponseMapper.toReviewPreviews(latestReviews),
      relatedProducts: ProductResponseMapper.toRelatedProducts(related, lang),
    };
  }
}
