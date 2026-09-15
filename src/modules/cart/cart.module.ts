import { Module } from '@nestjs/common';
import { CartRepository } from '../../repositories/cart.repository.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { AuthModule } from '../auth/auth.module.js';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CartController],
  providers: [
    CartRepository,
    ProductRepository,
    ProductVariantRepository,
    CartService,
  ],
  exports: [CartRepository, CartService],
})
export class CartModule {}
