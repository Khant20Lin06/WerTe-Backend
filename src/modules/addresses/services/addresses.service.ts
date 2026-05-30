import { Injectable } from '@nestjs/common';

import {
  AddressOwnershipEntity,
  AddressOwnershipRecord,
  buildAddressOwnership,
} from '../entities/address-ownership.entity';
import { AddressesRepository } from '../repositories/addresses.repository';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  findById(id: string): Promise<AddressOwnershipRecord | null> {
    return this.addressesRepository.findById(id);
  }

  listByCustomerProfileId(
    customerProfileId: string,
  ): Promise<AddressOwnershipRecord[]> {
    return this.addressesRepository.listByCustomerProfileId(customerProfileId);
  }

  findDefaultByCustomerProfileId(
    customerProfileId: string,
  ): Promise<AddressOwnershipRecord | null> {
    return this.addressesRepository.findDefaultByCustomerProfileId(
      customerProfileId,
    );
  }

  async findOwnedByUserId(
    userId: string,
    addressId: string,
  ): Promise<AddressOwnershipRecord | null> {
    const address = await this.findById(addressId);
    if (address === null || !this.belongsToUser(address, userId)) {
      return null;
    }

    return address;
  }

  buildOwnership(address: AddressOwnershipRecord): AddressOwnershipEntity {
    return buildAddressOwnership(address);
  }

  belongsToUser(address: AddressOwnershipRecord, userId: string): boolean {
    return address.customerProfile.user.id === userId;
  }

  belongsToCustomerProfile(
    address: AddressOwnershipRecord,
    customerProfileId: string,
  ): boolean {
    return address.customerProfile.id === customerProfileId;
  }
}
