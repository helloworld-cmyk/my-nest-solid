import { Module } from '@nestjs/common';
import { AddressController } from './address.controller.js';
import { AddressService } from './address.service.js';
import { UserAddressRepository } from '../../repositories/user-address.repository.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AddressController],
  providers: [UserAddressRepository, AddressService],
})
export class AddressModule {}
