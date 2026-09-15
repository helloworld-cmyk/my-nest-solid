import type { UserAddressRepository } from '../../repositories/user-address.repository.js';
import type { AddressResponseDto } from '../../modules/address/dto/response/address.js';

type RepositoryAddress = Awaited<
  ReturnType<UserAddressRepository['findAllByUserId']>
>[number];

export type AddressData = RepositoryAddress;
export type AddressListData = Awaited<
  ReturnType<UserAddressRepository['findAllByUserId']>
>;

export class AddressResponseMapper {
  private constructor() {}

  static toAddressResponse(address: AddressData): AddressResponseDto {
    return {
      id: address.id,
      name: address.name,
      address: address.address,
      email: address.email,
      phone: address.phone,
      isDefault: address.isDefault,
    };
  }

  static toAddressResponses(addresses: AddressListData): AddressResponseDto[] {
    return addresses.map((address) =>
      AddressResponseMapper.toAddressResponse(address),
    );
  }
}
