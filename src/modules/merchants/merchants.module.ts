import { Module } from '@nestjs/common';

import { AdminMerchantsController } from './controllers/admin-merchants.controller';
import { MerchantProfileController } from './controllers/merchant-profile.controller';
import { MerchantPolicyService } from './policies/merchant-policy.service';
import { MerchantsRepository } from './repositories/merchants.repository';
import { AdminMerchantManagementService } from './services/admin-merchant-management.service';
import { MerchantAccountService } from './services/merchant-account.service';
import { MerchantsService } from './services/merchants.service';

@Module({
  controllers: [MerchantProfileController, AdminMerchantsController],
  providers: [
    MerchantsRepository,
    MerchantsService,
    MerchantAccountService,
    MerchantPolicyService,
    AdminMerchantManagementService,
  ],
  exports: [MerchantsService, MerchantAccountService, MerchantPolicyService],
})
export class MerchantsModule {}
