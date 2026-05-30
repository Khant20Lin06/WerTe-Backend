import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';
import { CustomerProfilePolicyService } from '../policies/customer-profile-policy.service';
import { CustomerProfilesRepository } from '../repositories/customer-profiles.repository';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import {
  CustomerProfileDto,
  toCustomerProfileDto,
} from '../dto/customer-profile.dto';
import { CustomerProfilesService } from './customer-profiles.service';

@Injectable()
export class CustomerProfileAccountService {
  constructor(
    private readonly customerProfilesService: CustomerProfilesService,
    private readonly customerProfilesRepository: CustomerProfilesRepository,
    private readonly customerProfilePolicyService: CustomerProfilePolicyService,
  ) {}

  async getCurrentProfile(
    currentUser: AuthenticatedUserEntity,
  ): Promise<CustomerProfileDto> {
    const profile = await this.resolveOwnedProfile(currentUser);

    return toCustomerProfileDto(profile);
  }

  async updateCurrentProfile(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileDto> {
    const profile = await this.resolveOwnedProfile(currentUser);
    const updatedProfile = await this.customerProfilesRepository.update(profile.id, {
      ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
      ...(payload.avatarUrl !== undefined
        ? { avatarUrl: payload.avatarUrl }
        : {}),
    });

    return toCustomerProfileDto(updatedProfile);
  }

  private async resolveOwnedProfile(
    currentUser: AuthenticatedUserEntity,
  ): Promise<CustomerProfileOwnershipRecord> {
    const actorCustomerProfileId = currentUser.actorContext.customerProfileId;
    const profile =
      actorCustomerProfileId !== undefined
        ? await this.customerProfilesService.findOwnedByUserId(
            currentUser.userId,
            actorCustomerProfileId,
          )
        : await this.customerProfilesService.findByUserId(currentUser.userId);

    if (profile === null) {
      throw new AppException(
        'Customer profile was not found for the authenticated user.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (
      !this.customerProfilePolicyService.canAccessProfile(currentUser, profile)
    ) {
      throw new AppException(
        'You are not allowed to access this customer profile.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return profile;
  }
}
