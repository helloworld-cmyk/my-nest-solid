import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { WishlistService } from './wishlist.service.js';
import { AddWishlistDto } from './dto/request/add-wishlist.js';
import {
  WishlistItemResponseDto,
  WishlistListResponseDto,
} from './dto/response/wishlist-item.js';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wishlist items of the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of wishlist items (newest first)',
    type: WishlistListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  listWishlist(@Request() req: { user: { id: string } }) {
    return this.wishlistService.listWishlist(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product added to wishlist successfully',
    type: WishlistItemResponseDto,
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
    description: 'Product already in wishlist',
  })
  addToWishlist(
    @Request() req: { user: { id: string } },
    @Body() dto: AddWishlistDto,
  ) {
    return this.wishlistService.addToWishlist(req.user.id, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Wishlist item removed successfully',
    type: WishlistItemResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product is not in wishlist',
  })
  removeFromWishlist(
    @Request() req: { user: { id: string } },
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }
}
