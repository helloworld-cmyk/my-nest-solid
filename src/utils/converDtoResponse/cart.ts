import type {
  CartItemWithRelations,
  CartWithItems,
} from '../../repositories/cart.repository.js';
import { ProductResponseMapper } from './product.js';
import type {
  CartItemResponseDto,
  CartProductDto,
  CartResponseDto,
  CartVariantDto,
} from '../../modules/cart/dto/response/cart.js';

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export class CartResponseMapper {
  private constructor() {}

  static resolveUnitPrice(
    item: Pick<CartItemWithRelations, 'product' | 'variant'>,
  ): number {
    if (item.variant?.price != null) {
      return Number(item.variant.price);
    }
    return Number(item.product.price);
  }

  static toCartProduct(item: CartItemWithRelations): CartProductDto {
    const { product } = item;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      originalPrice:
        product.originalPrice == null ? null : Number(product.originalPrice),
      category: product.category.name,
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

  static toCartItem(item: CartItemWithRelations): CartItemResponseDto {
    const unitPrice = CartResponseMapper.resolveUnitPrice(item);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: roundMoney(unitPrice * item.quantity),
      product: CartResponseMapper.toCartProduct(item),
      variant: CartResponseMapper.toCartVariant(item),
      createdAt: item.createdAt,
    };
  }

  static toCartItems(items: CartItemWithRelations[]): CartItemResponseDto[] {
    return items.map((item) => CartResponseMapper.toCartItem(item));
  }

  static toCartResponse(cart: CartWithItems): CartResponseDto {
    const items = CartResponseMapper.toCartItems(cart.items);
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
