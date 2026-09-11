import type { WishlistItemWithProduct } from '../../repositories/wishlist.repository.js';
import { ProductResponseMapper } from './product.js';
import type {
  WishlistItemResponseDto,
  WishlistProductDto,
} from '../../modules/wishlist/dto/response/wishlist-item.js';

export class WishlistResponseMapper {
  private constructor() {}

  static toWishlistProduct(
    product: WishlistItemWithProduct['product'],
  ): WishlistProductDto {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      originalPrice:
        product.originalPrice == null ? null : Number(product.originalPrice),
      category: product.category.name,
      imagePath: ProductResponseMapper.pickCoverImage(product.images),
      ratingAvg: Number(product.ratingAvg),
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
    };
  }

  static toWishlistItem(
    item: WishlistItemWithProduct,
  ): WishlistItemResponseDto {
    return {
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      product: WishlistResponseMapper.toWishlistProduct(item.product),
      createdAt: item.createdAt,
    };
  }

  static toWishlistItems(
    items: WishlistItemWithProduct[],
  ): WishlistItemResponseDto[] {
    return items.map((item) => WishlistResponseMapper.toWishlistItem(item));
  }
}
