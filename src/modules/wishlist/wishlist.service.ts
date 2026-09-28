import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../../../prisma/generated/prisma/enums.js';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { WishlistRepository } from '../../repositories/wishlist.repository.js';
import { WishlistResponseMapper } from '../../utils/converDtoResponse/wishlist.js';
import { AddWishlistRequestDto } from './dto/request/add-wishlist.js';
import {
  WishlistItemResponseDto,
  WishlistListResponseDto,
} from './dto/response/wishlist-item.js';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async listWishlist(userId: string): Promise<WishlistListResponseDto> {
    const items = await this.wishlistRepository.listByUser(userId);
    return {
      items: WishlistResponseMapper.toWishlistItems(
        items,
        this.translator.currentLang,
      ),
    };
  }

  async addToWishlist(
    userId: string,
    dto: AddWishlistRequestDto,
  ): Promise<WishlistItemResponseDto> {
    const { data } = dto;
    const product = await this.productRepository.findById(data.productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(
        this.translator.t('wishlist.productNotFound'),
      );
    }

    const existing = await this.wishlistRepository.existsByUserAndProduct(
      userId,
      data.productId,
    );
    if (existing) {
      throw new ConflictException(
        this.translator.t('wishlist.alreadyInWishlist'),
      );
    }

    await this.wishlistRepository.add(userId, data.productId);

    const created = await this.wishlistRepository.findByUserAndProduct(
      userId,
      data.productId,
    );
    if (!created) {
      throw new NotFoundException(
        this.translator.t('wishlist.productNotFound'),
      );
    }
    return WishlistResponseMapper.toWishlistItem(
      created,
      this.translator.currentLang,
    );
  }

  async removeFromWishlist(
    userId: string,
    productId: number,
  ): Promise<WishlistItemResponseDto> {
    const existing = await this.wishlistRepository.findByUserAndProduct(
      userId,
      productId,
    );
    if (!existing) {
      throw new NotFoundException(this.translator.t('wishlist.notInWishlist'));
    }

    await this.wishlistRepository.remove(userId, productId);
    return WishlistResponseMapper.toWishlistItem(
      existing,
      this.translator.currentLang,
    );
  }
}
