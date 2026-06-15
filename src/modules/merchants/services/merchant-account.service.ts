import { HttpStatus, Injectable } from '@nestjs/common';
import { MerchantStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
import { MerchantPolicyService } from '../policies/merchant-policy.service';
import { MerchantsRepository } from '../repositories/merchants.repository';
import { MerchantProfileDto, toMerchantProfileDto } from '../dto/merchant-profile.dto';
import { UpdateMerchantProfileDto } from '../dto/update-merchant-profile.dto';
import { MerchantsService } from './merchants.service';

@Injectable()
export class MerchantAccountService {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly merchantsRepository: MerchantsRepository,
    private readonly merchantPolicyService: MerchantPolicyService,
  ) {}

  async getCurrentMerchantProfile(
    currentUser: AuthenticatedUserEntity,
  ): Promise<MerchantProfileDto> {
    const merchant = await this.resolveOwnedMerchant(currentUser);

    return toMerchantProfileDto(merchant);
  }

  async updateCurrentMerchantProfile(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateMerchantProfileDto,
  ): Promise<MerchantProfileDto> {
    const merchant = await this.resolveOwnedMerchant(currentUser);
    const updatedMerchant = await this.merchantsRepository.update(merchant.id, {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.supportPhone !== undefined
        ? { supportPhone: payload.supportPhone }
        : {}),
      ...(payload.storeType !== undefined
        ? { storeType: this.normalizeStoreTypeCode(payload.storeType) }
        : {}),
    });

    return toMerchantProfileDto(updatedMerchant);
  }

  async resolveOwnedMerchant(
    currentUser: AuthenticatedUserEntity,
  ): Promise<MerchantOwnershipRecord> {
    const actorMerchantId = currentUser.actorContext.merchantId;
    const merchant =
      actorMerchantId !== undefined
        ? await this.merchantsService.findOwnedByUserId(
            currentUser.userId,
            actorMerchantId,
          )
        : await this.merchantsService.findByUserId(currentUser.userId);

    if (merchant === null) {
      throw new AppException(
        'Merchant profile was not found for the authenticated user.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (merchant.status === MerchantStatus.PENDING) {
      throw new AppException(
        'Your merchant account is pending admin approval.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.accountPending },
      );
    }

    if (merchant.status === MerchantStatus.SUSPENDED) {
      throw new AppException(
        'Your merchant account has been suspended.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.accountSuspended },
      );
    }

    if (!this.merchantPolicyService.canAccessMerchant(currentUser, merchant)) {
      throw new AppException(
        'You are not allowed to access this merchant profile.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return merchant;
  }

  private normalizeStoreTypeCode(storeType: string): string {
    return storeType.trim().toLowerCase();
  }
}
