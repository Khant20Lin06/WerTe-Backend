import { HttpStatus, Injectable } from '@nestjs/common';
import { PromotionDiscountType } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionDto, toPromotionDto } from '../dto/promotion.dto';
import { buildPromotionEntity } from '../entities/promotion.entity';
import { PromotionsRepository } from '../repositories/promotions.repository';
import { PromotionPricingService } from './promotion-pricing.service';

@Injectable()
export class MerchantPromotionsService {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly promotionsRepository: PromotionsRepository,
    private readonly promotionPricingService: PromotionPricingService,
  ) {}

  async listBranchPromotions(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<PromotionDto[]> {
    await this.requireOwnedBranch(currentUser, branchId);

    const promotions = await this.promotionsRepository.listBranchPromotions(branchId);

    return promotions.map((promotion) =>
      toPromotionDto(buildPromotionEntity(promotion)),
    );
  }

  async getBranchPromotion(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    promotionId: string,
  ): Promise<PromotionDto> {
    await this.requireOwnedBranch(currentUser, branchId);
    const promotion = await this.requireBranchPromotion(branchId, promotionId);

    return toPromotionDto(buildPromotionEntity(promotion));
  }

  async createBranchPromotion(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: CreatePromotionDto,
  ): Promise<PromotionDto> {
    await this.requireOwnedBranch(currentUser, branchId);
    this.assertPromotionWindow(payload.startsAt, payload.endsAt);
    this.assertDiscountPayload(
      payload.discountType,
      payload.discountValue,
      payload.maximumDiscountAmount,
    );

    const code = this.requireNormalizedCode(payload.code);
    await this.assertCodeIsAvailable(branchId, code);

    const promotion = await this.promotionsRepository.createPromotion({
      branchId,
      code,
      name: payload.name.trim(),
      description: this.normalizeOptionalString(payload.description),
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minimumSubtotalAmount: payload.minimumSubtotalAmount ?? 0,
      maximumDiscountAmount: payload.maximumDiscountAmount ?? null,
      perCustomerLimit: payload.perCustomerLimit ?? null,
      startsAt: this.toOptionalDate(payload.startsAt),
      endsAt: this.toOptionalDate(payload.endsAt),
      isActive: payload.isActive ?? true,
    });

    return toPromotionDto(buildPromotionEntity(promotion));
  }

  async updateBranchPromotion(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    promotionId: string,
    payload: UpdatePromotionDto,
  ): Promise<PromotionDto> {
    await this.requireOwnedBranch(currentUser, branchId);
    const promotion = await this.requireBranchPromotion(branchId, promotionId);

    const nextCode =
      payload.code !== undefined
        ? this.requireNormalizedCode(payload.code)
        : promotion.code;
    const nextDiscountType = payload.discountType ?? promotion.discountType;
    const nextDiscountValue =
      payload.discountValue ?? Number(promotion.discountValue);
    const nextMaximumDiscountAmount =
      payload.maximumDiscountAmount !== undefined
        ? payload.maximumDiscountAmount
        : promotion.maximumDiscountAmount?.toNumber();
    const nextStartsAt =
      payload.startsAt !== undefined
        ? payload.startsAt
        : promotion.startsAt?.toISOString();
    const nextEndsAt =
      payload.endsAt !== undefined ? payload.endsAt : promotion.endsAt?.toISOString();

    this.assertPromotionWindow(nextStartsAt, nextEndsAt);
    this.assertDiscountPayload(
      nextDiscountType,
      nextDiscountValue,
      nextMaximumDiscountAmount,
    );

    if (nextCode !== promotion.code) {
      await this.assertCodeIsAvailable(branchId, nextCode, promotionId);
    }

    const updatedPromotion = await this.promotionsRepository.updatePromotion(
      promotionId,
      {
        ...(payload.code !== undefined ? { code: nextCode } : {}),
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.description !== undefined
          ? { description: this.normalizeOptionalString(payload.description) }
          : {}),
        ...(payload.discountType !== undefined
          ? { discountType: payload.discountType }
          : {}),
        ...(payload.discountValue !== undefined
          ? { discountValue: payload.discountValue }
          : {}),
        ...(payload.minimumSubtotalAmount !== undefined
          ? { minimumSubtotalAmount: payload.minimumSubtotalAmount }
          : {}),
        ...(payload.maximumDiscountAmount !== undefined
          ? { maximumDiscountAmount: payload.maximumDiscountAmount }
          : {}),
        ...(payload.perCustomerLimit !== undefined
          ? { perCustomerLimit: payload.perCustomerLimit ?? null }
          : {}),
        ...(payload.startsAt !== undefined
          ? { startsAt: this.toOptionalDate(payload.startsAt) }
          : {}),
        ...(payload.endsAt !== undefined
          ? { endsAt: this.toOptionalDate(payload.endsAt) }
          : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      },
    );

    return toPromotionDto(buildPromotionEntity(updatedPromotion));
  }

  async deleteBranchPromotion(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    promotionId: string,
  ): Promise<void> {
    await this.requireOwnedBranch(currentUser, branchId);
    await this.requireBranchPromotion(branchId, promotionId);
    await this.promotionsRepository.softDeletePromotion(promotionId);
  }

  private async requireOwnedBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchOwnershipRecord> {
    const branch = await this.branchesService.findOwnedByUserId(
      currentUser.userId,
      branchId,
    );

    if (branch === null) {
      throw new AppException(
        'The requested branch was not found for the authenticated merchant.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return branch;
  }

  private async requireBranchPromotion(branchId: string, promotionId: string) {
    const promotion = await this.promotionsRepository.findPromotionById(promotionId);

    if (promotion === null || promotion.branchId !== branchId) {
      throw new AppException('Promotion was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return promotion;
  }

  private async assertCodeIsAvailable(
    branchId: string,
    code: string,
    existingPromotionId?: string,
  ): Promise<void> {
    const existing = await this.promotionsRepository.findPromotionByBranchIdAndCode(
      branchId,
      code,
    );

    if (existing === null || existing.id === existingPromotionId) {
      return;
    }

    throw new AppException(
      'This promotion code is already in use for the branch.',
      HttpStatus.CONFLICT,
      {
        code: ErrorCodes.conflict,
        details: {
          branchId,
          code,
        },
      },
    );
  }

  private requireNormalizedCode(code: string): string {
    const normalized = this.promotionPricingService.normalizePromotionCode(code);

    if (normalized === null) {
      throw new AppException(
        'A non-empty promotion code is required.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return normalized;
  }

  private assertPromotionWindow(
    startsAt?: string | null,
    endsAt?: string | null,
  ): void {
    const startDate = this.toOptionalDate(startsAt);
    const endDate = this.toOptionalDate(endsAt);

    if (
      startDate !== null &&
      endDate !== null &&
      endDate.getTime() <= startDate.getTime()
    ) {
      throw new AppException(
        'Promotion end time must be later than the start time.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private assertDiscountPayload(
    discountType: PromotionDiscountType,
    discountValue: number,
    maximumDiscountAmount?: number | null,
  ): void {
    if (
      discountType === PromotionDiscountType.PERCENTAGE &&
      discountValue > 100
    ) {
      throw new AppException(
        'Percentage promotions cannot exceed 100 percent.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    if (
      maximumDiscountAmount !== undefined &&
      maximumDiscountAmount !== null &&
      maximumDiscountAmount <= 0
    ) {
      throw new AppException(
        'Maximum discount amount must be greater than zero.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private normalizeOptionalString(value?: string | null): string | null {
    const normalized = value?.trim();

    return normalized !== undefined && normalized.length > 0 ? normalized : null;
  }

  private toOptionalDate(value?: string | null): Date | null {
    if (value === undefined || value === null || value.trim().length === 0) {
      return null;
    }

    return new Date(value);
  }
}
