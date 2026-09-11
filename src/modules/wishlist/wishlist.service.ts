import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../../../prisma/generated/prisma/enums.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { WishlistRepository } from '../../repositories/wishlist.repository.js';
import { WishlistResponseMapper } from '../../utils/converDtoResponse/wishlist.js';
import { AddWishlistDto } from './dto/request/add-wishlist.js';
import {
  WishlistItemResponseDto,
  WishlistListResponseDto,
} from './dto/response/wishlist-item.js';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async listWishlist(userId: string): Promise<WishlistListResponseDto> {
    const items = await this.wishlistRepository.listByUser(userId);
    return { items: WishlistResponseMapper.toWishlistItems(items) };
  }

  async addToWishlist(
    userId: string,
    dto: AddWishlistDto,
  ): Promise<WishlistItemResponseDto> {
    const product = await this.productRepository.findById(dto.productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.wishlistRepository.existsByUserAndProduct(
      userId,
      dto.productId,
    );
    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    await this.wishlistRepository.add(userId, dto.productId);

    const created = await this.wishlistRepository.findByUserAndProduct(
      userId,
      dto.productId,
    );
    if (!created) {
      throw new NotFoundException('Product not found');
    }
    return WishlistResponseMapper.toWishlistItem(created);
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
      throw new NotFoundException('Product is not in wishlist');
    }

    await this.wishlistRepository.remove(userId, productId);
    return WishlistResponseMapper.toWishlistItem(existing);
  }
}
