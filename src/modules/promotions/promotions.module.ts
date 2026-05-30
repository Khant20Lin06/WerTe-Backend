import { Module } from '@nestjs/common';

import { BranchesModule } from '../branches/branches.module';
import { MerchantPromotionsController } from './controllers/merchant-promotions.controller';
import { PromotionPricingService } from './services/promotion-pricing.service';
import { MerchantPromotionsService } from './services/merchant-promotions.service';
import { PromotionsRepository } from './repositories/promotions.repository';

@Module({
  imports: [BranchesModule],
  controllers: [MerchantPromotionsController],
  providers: [
    PromotionsRepository,
    PromotionPricingService,
    MerchantPromotionsService,
  ],
  exports: [
    PromotionsRepository,
    PromotionPricingService,
    MerchantPromotionsService,
  ],
})
export class PromotionsModule {}
