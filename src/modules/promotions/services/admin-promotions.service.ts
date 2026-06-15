import { HttpStatus, Injectable } from '@nestjs/common';
import { PromotionDiscountType } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminPromotionDto, toAdminPromotionDto } from '../dto/admin-promotion.dto';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionsRepository } from '../repositories/promotions.repository';
import { PromotionPricingService } from './promotion-pricing.service';

@Injectable()
export class AdminPromotionsService {
  constructor(
    private readonly promotionsRepository: PromotionsRepository,
    private readonly promotionPricingService: PromotionPricingService,
    private readonly prisma: PrismaService,
  ) {}

  async listPromotions(): Promise<AdminPromotionDto[]> {
    const records = await this.promotionsRepository.findAll();

    // Batch-load branch + merchant names
    const branchIds = [...new Set(records.map(r => r.branchId))];
    const branches = await this.prisma.branch.findMany({
      where: { id: { in: branchIds } },
      select: {
        id: true,
        name: true,
        merchant: { select: { name: true } },
      },
    });
    const branchMap = new Map(branches.map(b => [b.id, b]));

    return records.map(r =>
      toAdminPromotionDto(r, branchMap.get(r.branchId) ?? null),
    );
  }

  async createPromotion(
    branchId: string,
    payload: CreatePromotionDto,
  ): Promise<AdminPromotionDto> {
    this.assertPromotionWindow(payload.startsAt, payload.endsAt);
    this.assertDiscountPayload(
      payload.discountType,
      payload.discountValue,
      payload.maximumDiscountAmount,
    );

    const code = this.requireNormalizedCode(payload.code);
    await this.assertCodeIsAvailable(branchId, code);

    const record = await this.promotionsRepository.createPromotion({
      branchId,
      code,
      name: payload.name.trim(),
      description: this.normalizeOptionalString(payload.description),
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minimumSubtotalAmount: payload.minimumSubtotalAmount ?? 0,
      maximumDiscountAmount: payload.maximumDiscountAmount ?? null,
      startsAt: this.toOptionalDate(payload.startsAt),
      endsAt: this.toOptionalDate(payload.endsAt),
      isActive: payload.isActive ?? true,
    });

    const withCount = { ...record, _count: { orders: 0 } };
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true, merchant: { select: { name: true } } },
    });
    return toAdminPromotionDto(withCount, branch);
  }

  async updatePromotion(
    promotionId: string,
    payload: UpdatePromotionDto,
  ): Promise<AdminPromotionDto> {
    const existing = await this.promotionsRepository.findPromotionById(promotionId);
    if (existing === null) {
      throw new AppException('Promotion not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const nextCode =
      payload.code !== undefined
        ? this.requireNormalizedCode(payload.code)
        : existing.code;
    if (nextCode !== existing.code) {
      await this.assertCodeIsAvailable(existing.branchId, nextCode, promotionId);
    }

    const record = await this.promotionsRepository.updatePromotion(promotionId, {
      ...(payload.code !== undefined ? { code: nextCode } : {}),
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.description !== undefined
        ? { description: this.normalizeOptionalString(payload.description) }
        : {}),
      ...(payload.discountType !== undefined ? { discountType: payload.discountType } : {}),
      ...(payload.discountValue !== undefined ? { discountValue: payload.discountValue } : {}),
      ...(payload.minimumSubtotalAmount !== undefined
        ? { minimumSubtotalAmount: payload.minimumSubtotalAmount }
        : {}),
      ...(payload.maximumDiscountAmount !== undefined
        ? { maximumDiscountAmount: payload.maximumDiscountAmount }
        : {}),
      ...(payload.startsAt !== undefined
        ? { startsAt: this.toOptionalDate(payload.startsAt) }
        : {}),
      ...(payload.endsAt !== undefined ? { endsAt: this.toOptionalDate(payload.endsAt) } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    });

    const usageCount = await this.prisma.order.count({
      where: { promotionId },
    });
    const branch = await this.prisma.branch.findUnique({
      where: { id: record.branchId },
      select: { name: true, merchant: { select: { name: true } } },
    });
    return toAdminPromotionDto({ ...record, _count: { orders: usageCount } }, branch);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private requireNormalizedCode(code: string): string {
    const normalized = this.promotionPricingService.normalizePromotionCode(code);
    if (normalized === null) {
      throw new AppException('A non-empty promotion code is required.', HttpStatus.UNPROCESSABLE_ENTITY, {
        code: ErrorCodes.unprocessableEntity,
      });
    }
    return normalized;
  }

  private async assertCodeIsAvailable(
    branchId: string,
    code: string,
    existingId?: string,
  ): Promise<void> {
    const found = await this.promotionsRepository.findPromotionByBranchIdAndCode(branchId, code);
    if (found !== null && found.id !== existingId) {
      throw new AppException('This promotion code is already in use for the branch.', HttpStatus.CONFLICT, {
        code: ErrorCodes.conflict,
      });
    }
  }

  private assertPromotionWindow(startsAt?: string | null, endsAt?: string | null): void {
    const s = this.toOptionalDate(startsAt);
    const e = this.toOptionalDate(endsAt);
    if (s !== null && e !== null && e.getTime() <= s.getTime()) {
      throw new AppException('Promotion end time must be later than the start time.', HttpStatus.UNPROCESSABLE_ENTITY, {
        code: ErrorCodes.unprocessableEntity,
      });
    }
  }

  private assertDiscountPayload(
    type: PromotionDiscountType,
    value: number,
    max?: number | null,
  ): void {
    if (type === PromotionDiscountType.PERCENTAGE && value > 100) {
      throw new AppException('Percentage promotions cannot exceed 100%.', HttpStatus.UNPROCESSABLE_ENTITY, {
        code: ErrorCodes.unprocessableEntity,
      });
    }
    if (max !== undefined && max !== null && max <= 0) {
      throw new AppException('Maximum discount amount must be greater than zero.', HttpStatus.UNPROCESSABLE_ENTITY, {
        code: ErrorCodes.unprocessableEntity,
      });
    }
  }

  private normalizeOptionalString(value?: string | null): string | null {
    const t = value?.trim();
    return t !== undefined && t.length > 0 ? t : null;
  }

  private toOptionalDate(value?: string | null): Date | null {
    if (!value || value.trim().length === 0) return null;
    return new Date(value);
  }
}
