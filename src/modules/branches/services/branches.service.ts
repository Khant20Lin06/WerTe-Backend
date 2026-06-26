import { Injectable } from '@nestjs/common';

import {
  BranchOwnershipEntity,
  BranchOwnershipRecord,
  buildBranchOwnership,
} from '../entities/branch-ownership.entity';
import { BranchesRepository } from '../repositories/branches.repository';
import { BranchCacheService } from './branch-cache.service';

@Injectable()
export class BranchesService {
  constructor(
    private readonly branchesRepository: BranchesRepository,
    private readonly branchCache: BranchCacheService,
  ) {}

  async findById(id: string): Promise<BranchOwnershipRecord | null> {
    const cached = await this.branchCache.getById(id);
    if (cached !== null) return cached;

    const branch = await this.branchesRepository.findById(id);
    if (branch !== null) {
      await this.branchCache.setById(branch);
    }

    return branch;
  }

  async listByMerchantId(merchantId: string): Promise<BranchOwnershipRecord[]> {
    const cached = await this.branchCache.getListByMerchantId(merchantId);
    if (cached !== null) return cached;

    const branches = await this.branchesRepository.listByMerchantId(merchantId);
    await this.branchCache.setListByMerchantId(merchantId, branches);

    return branches;
  }

  async findOwnedByUserId(
    userId: string,
    branchId: string,
  ): Promise<BranchOwnershipRecord | null> {
    const branch = await this.findById(branchId);
    if (branch === null || !this.belongsToMerchantUser(branch, userId)) {
      return null;
    }

    return branch;
  }

  buildOwnership(branch: BranchOwnershipRecord): BranchOwnershipEntity {
    return buildBranchOwnership(branch);
  }

  belongsToMerchantUser(
    branch: BranchOwnershipRecord,
    userId: string,
  ): boolean {
    return branch.merchant.user.id === userId;
  }

  belongsToMerchant(branch: BranchOwnershipRecord, merchantId: string): boolean {
    return branch.merchant.id === merchantId;
  }

  async invalidateCache(branchId: string, merchantId: string): Promise<void> {
    await this.branchCache.invalidate(branchId, merchantId);
  }
}
