import { Module } from '@nestjs/common';
import { CouponRepository } from '../../repositories/coupon.repository.js';
import { AuthModule } from '../auth/auth.module.js';
import { CouponController } from './coupon.controller.js';
import { CouponService } from './coupon.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CouponController],
  providers: [CouponRepository, CouponService],
  exports: [CouponService],
})
export class CouponModule {}
