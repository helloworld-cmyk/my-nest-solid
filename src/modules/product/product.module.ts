import { Module } from '@nestjs/common';
import { CategoryRepository } from '../../repositories/category.repository.js';
import { ProductReviewRepository } from '../../repositories/product-review.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CategoryRepository,
    ProductReviewRepository,
    ProductVariantRepository,
  ],
  exports: [ProductService],
})
export class ProductModule {}
