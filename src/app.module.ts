import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.js';
import { ResponseInterceptor } from './common/interceptor/interceptor.js';
import { I18nAppModule } from './i18n/i18n.modules.js';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CategoryModule } from './modules/category/category.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { AddressModule } from './modules/address/address.module.js';
import { CouponModule } from './modules/coupon/coupon.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrderModule } from './modules/order/order.module.js';
import { CounterModule } from './modules/counter/counter.module.js';
import { PrismaModule } from './3rdparty/prisma/prisma.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { ReviewModule } from './modules/review/review.module.js';
import { WishlistModule } from './modules/wishlist/wishlist.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nAppModule,
    PrismaModule,
    AuthModule,
    ProfileModule,
    CategoryModule,
    PaymentModule,
    AddressModule,
    ProductModule,
    WishlistModule,
    ReviewModule,
    CouponModule,
    CartModule,
    OrderModule,
    CounterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
