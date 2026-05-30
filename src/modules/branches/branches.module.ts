import { Module } from '@nestjs/common';

import { MerchantsModule } from '../merchants/merchants.module';
import { ZonesModule } from '../zones/zones.module';
import { MerchantBranchesController } from './controllers/merchant-branches.controller';
import { BranchPolicyService } from './policies/branch-policy.service';
import { BranchesRepository } from './repositories/branches.repository';
import { MerchantBranchesService } from './services/merchant-branches.service';
import { BranchesService } from './services/branches.service';

@Module({
  imports: [MerchantsModule, ZonesModule],
  controllers: [MerchantBranchesController],
  providers: [
    BranchesRepository,
    BranchesService,
    MerchantBranchesService,
    BranchPolicyService,
  ],
  exports: [BranchesService, MerchantBranchesService],
})
export class BranchesModule {}
