import { Module } from '@nestjs/common';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductReviewRepository } from '../../repositories/product-review.repository.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { AuthModule } from '../auth/auth.module.js';
import { ReviewController } from './review.controller.js';
import { ReviewService } from './review.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ReviewController],
  providers: [
    ProductReviewRepository,
    ProductRepository,
    UserRepository,
    ReviewService,
  ],
})
export class ReviewModule {}
