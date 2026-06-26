import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddressesService } from '../../addresses/services/addresses.service';
import { BranchesService } from '../../branches/services/branches.service';
import { CartQueryService } from '../../carts/services/cart-query.service';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilesService } from '../../customer-profiles/services/customer-profiles.service';
import { AddressOwnershipRecord } from '../../addresses/entities/address-ownership.entity';
import { buildCheckoutContext, CheckoutContextEntity } from '../entities/checkout-context.entity';
import { hasCheckoutCustomerAccess } from '../policies/checkout-customer-access-policy.helper';
import { CheckoutValidationService } from './checkout-validation.service';

export type ResolveCheckoutContextInput = {
  branchId: string;
  addressId?: string;
  deliveryType?: 'DELIVERY' | 'PICKUP';
};

@Injectable()
export class CheckoutContextService {
  constructor(
    private readonly customerProfilesService: CustomerProfilesService,
    private readonly addressesService: AddressesService,
    private readonly branchesService: BranchesService,
    private readonly cartQueryService: CartQueryService,
    private readonly checkoutValidationService: CheckoutValidationService,
  ) {}

  async getValidatedCurrentCustomerCheckoutContext(
    currentUser: AuthenticatedUserEntity,
    input: ResolveCheckoutContextInput,
  ): Promise<CheckoutContextEntity> {
    const isPickup = input.deliveryType === 'PICKUP';
    const customerProfile = await this.resolveCurrentCustomerProfile(currentUser);
    const address = isPickup
      ? null
      : await this.resolveCheckoutAddress(customerProfile, input.addressId);
    const [branch, cart] = await Promise.all([
      this.resolveBranch(input.branchId),
      this.cartQueryService.getOwnedActiveCartAggregateOrEmpty(
        currentUser.userId,
        input.branchId,
      ),
    ]);

    await this.checkoutValidationService.assertCartReadyForCheckout(branch, cart);

    return buildCheckoutContext({
      customerProfile,
      address,
      branch,
      cart,
    });
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

    if (
      !hasCheckoutCustomerAccess({
        currentUser,
        ownerUserId: profile.user.id,
        customerProfileId: profile.id,
      })
    ) {
      throw new AppException(
        'You are not allowed to access this checkout customer context.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return profile;
  }

  private async resolveCheckoutAddress(
    customerProfile: CustomerProfileOwnershipRecord,
    addressId?: string,
  ): Promise<AddressOwnershipRecord> {
    if (addressId !== undefined) {
      const address = await this.addressesService.findById(addressId);

      if (
        address === null ||
        !hasCheckoutCustomerAccess({
          currentUser: {
            userId: customerProfile.user.id,
            sessionId: 'checkout-context',
            role: customerProfile.user.role,
            tokenType: 'access',
            actorContext: {
              userId: customerProfile.user.id,
              phone: customerProfile.user.phone,
              role: customerProfile.user.role,
              status: customerProfile.user.status,
              customerProfileId: customerProfile.id,
            },
          },
          ownerUserId: address.customerProfile.user.id,
          customerProfileId: address.customerProfile.id,
        }) ||
        address.customerProfile.id !== customerProfile.id
      ) {
        throw new AppException(
          'The requested checkout address was not found.',
          HttpStatus.NOT_FOUND,
          {
            code: ErrorCodes.notFound,
          },
        );
      }

      return address;
    }

    const defaultAddress = await this.addressesService.findDefaultByCustomerProfileId(
      customerProfile.id,
    );

    if (defaultAddress === null) {
      throw new AppException(
        'A default delivery address is required before checkout.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return defaultAddress;
  }

  private async resolveBranch(branchId: string) {
    const branch = await this.branchesService.findById(branchId);

    if (branch === null) {
      throw new AppException('Branch was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return branch;
  }
}
