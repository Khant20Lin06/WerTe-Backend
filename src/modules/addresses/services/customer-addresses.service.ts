import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilesService } from '../../customer-profiles/services/customer-profiles.service';
import { AddressDto, toAddressDto } from '../dto/address.dto';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressOwnershipRecord } from '../entities/address-ownership.entity';
import { AddressPolicyService } from '../policies/address-policy.service';
import { AddressesRepository } from '../repositories/addresses.repository';

@Injectable()
export class CustomerAddressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerProfilesService: CustomerProfilesService,
    private readonly addressesRepository: AddressesRepository,
    private readonly addressPolicyService: AddressPolicyService,
  ) {}

  async listCurrentCustomerAddresses(
    currentUser: AuthenticatedUserEntity,
  ): Promise<AddressDto[]> {
    const profile = await this.resolveCurrentCustomerProfile(currentUser);
    const addresses = await this.addressesRepository.listByCustomerProfileId(
      profile.id,
    );

    return addresses.map((address) => toAddressDto(address));
  }

  async createCurrentCustomerAddress(
    currentUser: AuthenticatedUserEntity,
    payload: CreateAddressDto,
  ): Promise<AddressDto> {
    const profile = await this.resolveCurrentCustomerProfile(currentUser);
    const address = await this.prisma.runInTransaction(async (tx) => {
      const existingCount = await this.addressesRepository.countByCustomerProfileId(
        profile.id,
        tx,
      );
      const shouldBecomeDefault = payload.isDefault === true || existingCount === 0;

      if (shouldBecomeDefault) {
        await this.addressesRepository.clearDefaultByCustomerProfileId(
          profile.id,
          tx,
        );
      }

      return this.addressesRepository.create(
        {
          customerProfileId: profile.id,
          label: payload.label,
          line1: payload.line1,
          line2: payload.line2,
          landmark: payload.landmark,
          township: payload.township,
          city: payload.city,
          postalCode: payload.postalCode,
          deliveryInstructions: payload.deliveryInstructions,
          latitude: payload.latitude,
          longitude: payload.longitude,
          isDefault: shouldBecomeDefault,
        },
        tx,
      );
    });

    return toAddressDto(address);
  }

  async updateCurrentCustomerAddress(
    currentUser: AuthenticatedUserEntity,
    addressId: string,
    payload: UpdateAddressDto,
  ): Promise<AddressDto> {
    const address = await this.resolveOwnedAddress(currentUser, addressId);

    if (payload.isDefault === false && address.isDefault) {
      throw new AppException(
        'A customer must always keep one default address. Set another address as default before unsetting this one.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    const updatedAddress = await this.prisma.runInTransaction(async (tx) => {
      const shouldBecomeDefault =
        payload.isDefault === true || (payload.isDefault === undefined && address.isDefault);

      if (payload.isDefault === true && !address.isDefault) {
        await this.addressesRepository.clearDefaultByCustomerProfileId(
          address.customerProfile.id,
          tx,
        );
      }

      return this.addressesRepository.update(
        address.id,
        {
          ...(payload.label !== undefined ? { label: payload.label } : {}),
          ...(payload.line1 !== undefined ? { line1: payload.line1 } : {}),
          ...(payload.line2 !== undefined ? { line2: payload.line2 } : {}),
          ...(payload.landmark !== undefined
            ? { landmark: payload.landmark }
            : {}),
          ...(payload.township !== undefined
            ? { township: payload.township }
            : {}),
          ...(payload.city !== undefined ? { city: payload.city } : {}),
          ...(payload.postalCode !== undefined
            ? { postalCode: payload.postalCode }
            : {}),
          ...(payload.deliveryInstructions !== undefined
            ? { deliveryInstructions: payload.deliveryInstructions }
            : {}),
          ...(payload.latitude !== undefined
            ? { latitude: payload.latitude }
            : {}),
          ...(payload.longitude !== undefined
            ? { longitude: payload.longitude }
            : {}),
          isDefault: shouldBecomeDefault,
        },
        tx,
      );
    });

    return toAddressDto(updatedAddress);
  }

  async deleteCurrentCustomerAddress(
    currentUser: AuthenticatedUserEntity,
    addressId: string,
  ) {
    const address = await this.resolveOwnedAddress(currentUser, addressId);

    const deletedAddress = await this.prisma.runInTransaction(async (tx) => {
      const removedAddress = await this.addressesRepository.delete(address.id, tx);

      if (removedAddress.isDefault) {
        const fallbackAddress =
          await this.addressesRepository.findLatestByCustomerProfileId(
            removedAddress.customerProfile.id,
            tx,
          );

        if (fallbackAddress !== null) {
          await this.addressesRepository.update(
            fallbackAddress.id,
            {
              isDefault: true,
            },
            tx,
          );
        }
      }

      return removedAddress;
    });

    return {
      deletedAddressId: deletedAddress.id,
    };
  }

  private async resolveCurrentCustomerProfile(
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

    if (!this.addressPolicyService.canListAddresses(currentUser, profile)) {
      throw new AppException(
        'You are not allowed to manage addresses for this customer profile.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return profile;
  }

  private async resolveOwnedAddress(
    currentUser: AuthenticatedUserEntity,
    addressId: string,
  ): Promise<AddressOwnershipRecord> {
    const address = await this.addressesRepository.findById(addressId);

    if (address === null) {
      throw new AppException('Address was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!this.addressPolicyService.canManageAddress(currentUser, address)) {
      throw new AppException(
        'You are not allowed to manage this address.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return address;
  }
}
