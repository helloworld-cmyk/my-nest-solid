import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard.js';
import { CouponService } from './coupon.service.js';
import { ListCouponsQueryDto } from './dto/request/list-coupons.query.js';
import { ValidateCouponRequestDto } from './dto/request/validate-coupon.js';
import {
  CouponListResponseDto,
  ValidateCouponResponseDto,
} from './dto/response/coupon.js';

@ApiTags('coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active coupons' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of active coupons (expiring soon first)',
    type: CouponListResponseDto,
  })
  listCoupons(@Query() query: ListCouponsQueryDto) {
    return this.couponService.listCoupons(query);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate a coupon code for the current order' })
  @ApiResponse({
    status: 200,
    description: 'Coupon is valid, returns the discount to apply',
    type: ValidateCouponResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Coupon is expired, inactive, over usage limit, or minimum order not met',
  })
  validateCoupon(
    @Request() req: { user: { id: string } },
    @Body() dto: ValidateCouponRequestDto,
  ) {
    return this.couponService.validateCoupon(req.user.id, dto);
  }
}
