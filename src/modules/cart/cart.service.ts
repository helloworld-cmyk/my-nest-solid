import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../../../prisma/generated/prisma/enums.js';
import { CartRepository } from '../../repositories/cart.repository.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { CartResponseMapper } from '../../utils/converDtoResponse/cart.js';
import { AddCartItemDto } from './dto/request/add-cart-item.js';
import { UpdateCartItemDto } from './dto/request/update-cart-item.js';
import { CartResponseDto } from './dto/response/cart.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    return CartResponseMapper.toCartResponse(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponseDto> {
    const quantity = dto.quantity ?? 1;
    const variantId = dto.variantId;

    const product = await this.productRepository.findById(dto.productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }

    const variant = await this.productVariantRepository.findById(variantId);
    if (!variant || variant.productId !== dto.productId) {
      throw new NotFoundException('Product variant not found');
    }
    if (!variant.isActive) {
      throw new BadRequestException('Product variant is not available');
    }
    if (variant.stock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    const existing = await this.cartRepository.findItemByCartProductVariant(
      cart.id,
      dto.productId,
      variantId,
    );

    if (existing) {
      const nextQuantity = existing.quantity + quantity;
      if (existing.variant.stock < nextQuantity) {
        throw new BadRequestException('Not enough stock');
      }
      await this.cartRepository.updateItemQuantity(existing.id, nextQuantity);
    } else {
      await this.cartRepository.createItem(
        cart.id,
        dto.productId,
        variantId,
        quantity,
      );
    }

    const updated = await this.cartRepository.findByUserId(userId);
    if (!updated) {
      return CartResponseMapper.toEmptyCartResponse(cart.id);
    }
    return CartResponseMapper.toCartResponse(updated);
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const existing = await this.cartRepository.findItemByIdAndUser(
      itemId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }

    if (!existing.variant.isActive) {
      throw new BadRequestException('Product variant is not available');
    }
    if (existing.variant.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    await this.cartRepository.updateItemQuantity(itemId, dto.quantity);

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return CartResponseMapper.toCartResponse(cart);
  }

  async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
    const existing = await this.cartRepository.findItemByIdAndUser(
      itemId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.deleteItem(itemId);

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return CartResponseMapper.toCartResponse(cart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    await this.cartRepository.clearByCartId(cart.id);
    return CartResponseMapper.toEmptyCartResponse(cart.id);
  }
}
