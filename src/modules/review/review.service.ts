import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductStatus } from '../../../prisma/generated/prisma/enums.js';
import { ProductRepository } from '../../repositories/product.repository.js';
import { ProductReviewRepository } from '../../repositories/product-review.repository.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { ReviewResponseMapper } from '../../utils/converDtoResponse/review.js';
import { CreateReviewDto } from './dto/request/create-review.js';
import { ListReviewsQueryDto } from './dto/request/list-reviews.query.js';
import {
  ReviewListResponseDto,
  ReviewResponseDto,
} from './dto/response/review.js';

@Injectable()
export class ReviewService {
  constructor(
    private readonly productReviewRepository: ProductReviewRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async listReviews(
    productId: number,
    query: ListReviewsQueryDto,
  ): Promise<ReviewListResponseDto> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [reviews, total] = await Promise.all([
      this.productReviewRepository.findByProductId(productId, page, limit),
      this.productReviewRepository.countByProductId(productId),
    ]);

    return ReviewResponseMapper.toReviewListResponse(
      reviews,
      page,
      limit,
      total,
    );
  }

  async createReview(
    productId: number,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.productReviewRepository.existsByProductAndUser(
      productId,
      userId,
    );
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userName = `${user.firstName} ${user.lastName}`.trim();
    const { review } = await this.productReviewRepository.createAndRecalcRating(
      {
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
        userName,
        avatarPath: user.avatarPath ?? null,
        rating: dto.rating,
        comment: dto.comment,
      },
    );

    return ReviewResponseMapper.toReviewItem(review);
  }
}
