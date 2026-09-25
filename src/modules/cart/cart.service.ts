import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../../../prisma/generated/prisma/enums.js';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { CartRepository } from '../../repositories/cart.repository.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { CartResponseMapper } from '../../utils/converDtoResponse/cart.js';
import { AddCartItemRequestDto } from './dto/request/add-cart-item.js';
import { UpdateCartItemRequestDto } from './dto/request/update-cart-item.js';
import { CartResponseDto } from './dto/response/cart.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    return CartResponseMapper.toCartResponse(cart);
  }

  async addItem(
    userId: string,
    dto: AddCartItemRequestDto,
  ): Promise<CartResponseDto> {
    const { data } = dto;
    const quantity = data.quantity ?? 1;
    const variantId = data.variantId;

    const product = await this.productRepository.findById(data.productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(this.translator.t('cart.productNotFound'));
    }

    const variant = await this.productVariantRepository.findById(variantId);
    if (!variant || variant.productId !== data.productId) {
      throw new NotFoundException(this.translator.t('cart.variantNotFound'));
    }
    if (!variant.isActive) {
      throw new BadRequestException(
        this.translator.t('cart.variantNotAvailable'),
      );
    }
    if (variant.stock < quantity) {
      throw new BadRequestException(this.translator.t('cart.notEnoughStock'));
    }

    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    const existing = await this.cartRepository.findItemByCartProductVariant(
      cart.id,
      data.productId,
      variantId,
    );

    if (existing) {
      const nextQuantity = existing.quantity + quantity;
      if (existing.variant.stock < nextQuantity) {
        throw new BadRequestException(this.translator.t('cart.notEnoughStock'));
      }
      await this.cartRepository.updateItemQuantity(existing.id, nextQuantity);
    } else {
      await this.cartRepository.createItem(
        cart.id,
        data.productId,
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
    dto: UpdateCartItemRequestDto,
  ): Promise<CartResponseDto> {
    const { data } = dto;
    const existing = await this.cartRepository.findItemByIdAndUser(
      itemId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException(this.translator.t('cart.itemNotFound'));
    }

    if (!existing.variant.isActive) {
      throw new BadRequestException(
        this.translator.t('cart.variantNotAvailable'),
      );
    }
    if (existing.variant.stock < data.quantity) {
      throw new BadRequestException(this.translator.t('cart.notEnoughStock'));
    }

    await this.cartRepository.updateItemQuantity(itemId, data.quantity);

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException(this.translator.t('cart.cartNotFound'));
    }
    return CartResponseMapper.toCartResponse(cart);
  }

  async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
    const existing = await this.cartRepository.findItemByIdAndUser(
      itemId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException(this.translator.t('cart.itemNotFound'));
    }

    await this.cartRepository.deleteItem(itemId);

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException(this.translator.t('cart.cartNotFound'));
    }
    return CartResponseMapper.toCartResponse(cart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    await this.cartRepository.clearByCartId(cart.id);
    return CartResponseMapper.toEmptyCartResponse(cart.id);
  }
}
