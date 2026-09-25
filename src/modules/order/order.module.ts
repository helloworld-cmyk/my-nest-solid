import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { CartRepository } from '../../repositories/cart.repository.js';
import { CouponRepository } from '../../repositories/coupon.repository.js';
import { OrderRepository } from '../../repositories/order.repository.js';
import { PaymentCardRepository } from '../../repositories/payment-card.repository.js';
import { ProductVariantRepository } from '../../repositories/product-variant.repository.js';
import { UserAddressRepository } from '../../repositories/user-address.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    CartRepository,
    UserAddressRepository,
    PaymentCardRepository,
    CouponRepository,
    ProductVariantRepository,
  ],
})
export class OrderModule {}
