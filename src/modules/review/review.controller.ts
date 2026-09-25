import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard.js';
import { CreateReviewRequestDto } from './dto/request/create-review.js';
import { ListReviewsQueryDto } from './dto/request/list-reviews.query.js';
import {
  ReviewListResponseDto,
  ReviewResponseDto,
} from './dto/response/review.js';
import { ReviewService } from './review.service.js';

@ApiTags('reviews')
@Controller('products/:productId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated reviews of a product' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of product reviews (newest first)',
    type: ReviewListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or not active',
  })
  listReviews(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: ListReviewsQueryDto,
  ) {
    return this.reviewService.listReviews(productId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Review created successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or not active',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User has already reviewed this product',
  })
  createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: { user: { id: string } },
    @Body() dto: CreateReviewRequestDto,
  ) {
    return this.reviewService.createReview(productId, req.user.id, dto);
  }
}
