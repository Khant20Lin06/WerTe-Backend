import { Module } from '@nestjs/common';

import { MerchantsModule } from '../merchants/merchants.module';
import { DiscoveryCacheModule } from '../store-types/discovery-cache.module';
import { ZonesModule } from '../zones/zones.module';
import { MerchantBranchesController } from './controllers/merchant-branches.controller';
import { BranchPolicyService } from './policies/branch-policy.service';
import { BranchesRepository } from './repositories/branches.repository';
import { BranchCacheService } from './services/branch-cache.service';
import { BranchesService } from './services/branches.service';
import { MerchantBranchesService } from './services/merchant-branches.service';

@Module({
  imports: [MerchantsModule, ZonesModule, DiscoveryCacheModule],
  controllers: [MerchantBranchesController],
  providers: [
    BranchesRepository,
    BranchCacheService,
    BranchesService,
    MerchantBranchesService,
    BranchPolicyService,
  ],
  exports: [BranchesService, MerchantBranchesService],
})
export class BranchesModule {}
