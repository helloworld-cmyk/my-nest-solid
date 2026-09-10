import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CategoryModule } from './modules/category/category.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { AddressModule } from './modules/address/address.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductModule } from './modules/product/product.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    CategoryModule,
    PaymentModule,
    AddressModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
