import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client.js';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { UserAddressRepository } from '../../repositories/user-address.repository.js';
import { AddressResponseMapper } from '../../utils/converDtoResponse/address.js';
import { CreateAddressRequestDto } from './dto/request/create-address.js';
import { UpdateAddressRequestDto } from './dto/request/update-address.js';
import { AddressResponseDto } from './dto/response/address.js';

@Injectable()
export class AddressService {
  constructor(
    private readonly userAddressRepository: UserAddressRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async listAddresses(userId: string): Promise<AddressResponseDto[]> {
    const addresses = await this.userAddressRepository.findAllByUserId(userId);
    return AddressResponseMapper.toAddressResponses(addresses);
  }

  async createAddress(
    userId: string,
    dto: CreateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const { data } = dto;
    if (data.isDefault) {
      await this.userAddressRepository.unsetDefaultForUser(userId);
    }

    const address = await this.userAddressRepository.create({
      user: { connect: { id: userId } },
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      isDefault: data.isDefault ?? false,
    });
    return AddressResponseMapper.toAddressResponse(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressRequestDto,
  ): Promise<AddressResponseDto> {
    const { data } = dto;
    const existing = await this.userAddressRepository.findByIdAndUser(
      addressId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException(this.translator.t('address.notFound'));
    }

    if (data.isDefault) {
      await this.userAddressRepository.unsetDefaultForUser(userId);
    }

    const updateData: Prisma.UserAddressUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

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
      throw new NotFoundException(this.translator.t('address.notFound'));
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
      throw new NotFoundException(this.translator.t('address.notFound'));
    }

    await this.userAddressRepository.unsetDefaultForUser(userId);
    const updated = await this.userAddressRepository.update(addressId, {
      isDefault: true,
    });
    return AddressResponseMapper.toAddressResponse(updated);
  }
}
