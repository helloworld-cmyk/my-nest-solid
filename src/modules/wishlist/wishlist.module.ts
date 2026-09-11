import { Module } from '@nestjs/common';
import { ProductRepository } from '../../repositories/product.repository.js';
import { WishlistRepository } from '../../repositories/wishlist.repository.js';
import { AuthModule } from '../auth/auth.module.js';
import { WishlistController } from './wishlist.controller.js';
import { WishlistService } from './wishlist.service.js';

@Module({
  imports: [AuthModule],
  controllers: [WishlistController],
  providers: [WishlistRepository, ProductRepository, WishlistService],
})
export class WishlistModule {}
