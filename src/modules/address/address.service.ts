import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client.js';
import { UserAddressRepository } from '../../repositories/user-address.repository.js';
import { AddressResponseMapper } from '../../utils/converDtoResponse/address.js';
import { CreateAddressDto } from './dto/request/create-address.js';
import { UpdateAddressDto } from './dto/request/update-address.js';
import { AddressResponseDto } from './dto/response/address.js';

@Injectable()
export class AddressService {
  constructor(private readonly userAddressRepository: UserAddressRepository) {}

  async listAddresses(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.userAddressRepository.findAllByUserId(userId);
    return AddressResponseMapper.toAddressResponses(addresses);
  }

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    if (dto.isDefault) {
      await this.userAddressRepository.unsetDefaultForUser(userId);
    }

    const address = await this.userAddressRepository.create({
      user: { connect: { id: userId } },
      name: dto.name,
      address: dto.address,
      email: dto.email,
      phone: dto.phone,
      isDefault: dto.isDefault ?? false,
    });
    return AddressResponseMapper.toAddressResponse(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const existing = await this.userAddressRepository.findByIdAndUser(
      addressId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault) {
      await this.userAddressRepository.unsetDefaultForUser(userId);
    }

    const updateData: Prisma.UserAddressUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;

    const updated = await this.userAddressRepository.update(
      addressId,
      updateData,
    );
    return AddressResponseMapper.toAddressResponse(updated);
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ): Promise<AddressResponseDto> {
    const existing = await this.userAddressRepository.findByIdAndUser(
      addressId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    const deleted = await this.userAddressRepository.delete(addressId);

    if (deleted.isDefault) {
      const next = await this.userAddressRepository.findFirstByUserId(userId);
      if (next) {
        await this.userAddressRepository.update(next.id, { isDefault: true });
      }
    }

    return AddressResponseMapper.toAddressResponse(deleted);
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<AddressResponseDto> {
    const existing = await this.userAddressRepository.findByIdAndUser(
      addressId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    await this.userAddressRepository.unsetDefaultForUser(userId);
    const updated = await this.userAddressRepository.update(addressId, {
      isDefault: true,
    });
    return AddressResponseMapper.toAddressResponse(updated);
  }
}
