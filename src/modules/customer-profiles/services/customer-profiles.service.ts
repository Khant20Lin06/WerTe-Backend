import { Injectable } from '@nestjs/common';

import {
  buildCustomerProfileOwnership,
  CustomerProfileOwnershipEntity,
  CustomerProfileOwnershipRecord,
} from '../entities/customer-profile-ownership.entity';
import { CustomerProfilesRepository } from '../repositories/customer-profiles.repository';

@Injectable()
export class CustomerProfilesService {
  constructor(
    private readonly customerProfilesRepository: CustomerProfilesRepository,
  ) {}

  findById(id: string): Promise<CustomerProfileOwnershipRecord | null> {
    return this.customerProfilesRepository.findById(id);
  }

  findByUserId(userId: string): Promise<CustomerProfileOwnershipRecord | null> {
    return this.customerProfilesRepository.findByUserId(userId);
  }

  async findOwnedByUserId(
    userId: string,
    customerProfileId: string,
  ): Promise<CustomerProfileOwnershipRecord | null> {
    const profile = await this.findById(customerProfileId);
    if (profile === null || !this.belongsToUser(profile, userId)) {
      return null;
    }

    return profile;
  }

  buildOwnership(
    profile: CustomerProfileOwnershipRecord,
  ): CustomerProfileOwnershipEntity {
    return buildCustomerProfileOwnership(profile);
  }

  belongsToUser(
    profile: CustomerProfileOwnershipRecord,
    userId: string,
  ): boolean {
    return profile.user.id === userId;
  }
}
