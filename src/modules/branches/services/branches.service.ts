import { Injectable } from '@nestjs/common';

import {
  BranchOwnershipEntity,
  BranchOwnershipRecord,
  buildBranchOwnership,
} from '../entities/branch-ownership.entity';
import { BranchesRepository } from '../repositories/branches.repository';

@Injectable()
export class BranchesService {
  constructor(private readonly branchesRepository: BranchesRepository) {}

  findById(id: string): Promise<BranchOwnershipRecord | null> {
    return this.branchesRepository.findById(id);
  }

  listByMerchantId(merchantId: string): Promise<BranchOwnershipRecord[]> {
    return this.branchesRepository.listByMerchantId(merchantId);
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
}
