import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { PaymentCardRepository } from '../../repositories/payment-card.repository.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PaymentController],
  providers: [PaymentCardRepository, PaymentService],
})
export class PaymentModule {}
