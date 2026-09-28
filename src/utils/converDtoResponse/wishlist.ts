import type { WishlistItemWithProduct } from '../../repositories/wishlist.repository.js';
import { pickTranslation } from '../i18n/pick-translation.js';
import { ProductResponseMapper } from './product.js';
import type {
  WishlistItemResponseDto,
  WishlistProductDto,
} from '../../modules/wishlist/dto/response/wishlist-item.js';

export class WishlistResponseMapper {
  private constructor() {}

  static toWishlistProduct(
    product: WishlistItemWithProduct['product'],
    lang?: string,
  ): WishlistProductDto {
    const translation = pickTranslation(product.translations, lang);
    const categoryTranslation = pickTranslation(
      product.category.translations,
      lang,
    );
    return {
      id: product.id,
      slug: translation?.slug ?? '',
      name: translation?.name ?? '',
      price: Number(product.price),
      originalPrice:
        product.originalPrice == null ? null : Number(product.originalPrice),
      category: categoryTranslation?.name ?? '',
      imagePath: ProductResponseMapper.pickCoverImage(product.images),
      ratingAvg: Number(product.ratingAvg),
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
    };
  }

  static toWishlistItem(
    item: WishlistItemWithProduct,
    lang?: string,
  ): WishlistItemResponseDto {
    return {
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      product: WishlistResponseMapper.toWishlistProduct(item.product, lang),
      createdAt: item.createdAt,
    };
  }

  static toWishlistItems(
    items: WishlistItemWithProduct[],
    lang?: string,
  ): WishlistItemResponseDto[] {
    return items.map((item) =>
      WishlistResponseMapper.toWishlistItem(item, lang),
    );
  }
}
