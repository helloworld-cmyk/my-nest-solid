import { Module } from '@nestjs/common';
import { CounterGateway } from './counter.gateway.js';
import { CounterService } from './counter.service.js';

@Module({
  providers: [CounterService, CounterGateway],
  exports: [CounterService],
})
export class CounterModule {}
