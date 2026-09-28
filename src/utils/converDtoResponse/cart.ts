import type {
  CartItemWithRelations,
  CartWithItems,
} from '../../repositories/cart.repository.js';
import { roundMoney } from '../money/index.js';
import { resolveUnitPrice as resolveUnitPriceUtil } from '../price/index.js';
import { pickTranslation } from '../i18n/pick-translation.js';
import { ProductResponseMapper } from './product.js';
import type {
  CartItemResponseDto,
  CartProductDto,
  CartResponseDto,
  CartVariantDto,
} from '../../modules/cart/dto/response/cart.js';

export class CartResponseMapper {
  private constructor() {}

  static resolveUnitPrice(
    item: Pick<CartItemWithRelations, 'product' | 'variant'>,
  ): number {
    return resolveUnitPriceUtil(item.product, item.variant);
  }

  static toCartProduct(
    item: CartItemWithRelations,
    lang?: string,
  ): CartProductDto {
    const { product } = item;
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
    };
  }

  static toCartVariant(item: CartItemWithRelations): CartVariantDto {
    return {
      id: item.variant.id,
      colorHexCode: item.variant.colorHexCode,
      size: item.variant.size,
      stock: item.variant.stock,
      isActive: item.variant.isActive,
    };
  }

  static toCartItem(
    item: CartItemWithRelations,
    lang?: string,
  ): CartItemResponseDto {
    const unitPrice = CartResponseMapper.resolveUnitPrice(item);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: roundMoney(unitPrice * item.quantity),
      product: CartResponseMapper.toCartProduct(item, lang),
      variant: CartResponseMapper.toCartVariant(item),
      createdAt: item.createdAt,
    };
  }

  static toCartItems(
    items: CartItemWithRelations[],
    lang?: string,
  ): CartItemResponseDto[] {
    return items.map((item) => CartResponseMapper.toCartItem(item, lang));
  }

  static toCartResponse(cart: CartWithItems, lang?: string): CartResponseDto {
    const items = CartResponseMapper.toCartItems(cart.items, lang);
    return {
      id: cart.id,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: roundMoney(
        items.reduce((sum, item) => sum + item.totalPrice, 0),
      ),
    };
  }

  static toEmptyCartResponse(cartId: string): CartResponseDto {
    return { id: cartId, items: [], totalItems: 0, subtotal: 0 };
  }
}
