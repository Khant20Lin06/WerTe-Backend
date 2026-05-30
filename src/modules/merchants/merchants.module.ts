import { Module } from '@nestjs/common';

import { MerchantProfileController } from './controllers/merchant-profile.controller';
import { MerchantPolicyService } from './policies/merchant-policy.service';
import { MerchantsRepository } from './repositories/merchants.repository';
import { MerchantAccountService } from './services/merchant-account.service';
import { MerchantsService } from './services/merchants.service';

@Module({
  controllers: [MerchantProfileController],
  providers: [
    MerchantsRepository,
    MerchantsService,
    MerchantAccountService,
    MerchantPolicyService,
  ],
  exports: [MerchantsService, MerchantAccountService, MerchantPolicyService],
})
export class MerchantsModule {}
