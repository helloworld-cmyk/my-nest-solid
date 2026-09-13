import type { ReviewWithUser } from '../../repositories/product-review.repository.js';
import type {
  ReviewResponseDto,
  ReviewListResponseDto,
} from '../../modules/review/dto/response/review.js';

export class ReviewResponseMapper {
  private constructor() {}

  static toReviewItem(review: ReviewWithUser): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      userName: review.userName,
      avatarPath: review.avatarPath ?? review.user?.avatarPath ?? null,
      rating: Number(review.rating),
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  static toReviewItems(reviews: ReviewWithUser[]): ReviewResponseDto[] {
    return reviews.map((review) => ReviewResponseMapper.toReviewItem(review));
  }

  static toReviewListResponse(
    reviews: ReviewWithUser[],
    page: number,
    limit: number,
    total: number,
  ): ReviewListResponseDto {
    return {
      items: ReviewResponseMapper.toReviewItems(reviews),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}
