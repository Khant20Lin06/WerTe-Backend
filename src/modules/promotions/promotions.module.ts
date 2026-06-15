import { Module } from '@nestjs/common';

import { BranchesModule } from '../branches/branches.module';
import { AdminPromotionsController } from './controllers/admin-promotions.controller';
import { MerchantPromotionsController } from './controllers/merchant-promotions.controller';
import { PromotionPricingService } from './services/promotion-pricing.service';
import { AdminPromotionsService } from './services/admin-promotions.service';
import { MerchantPromotionsService } from './services/merchant-promotions.service';
import { PromotionsRepository } from './repositories/promotions.repository';

@Module({
  imports: [BranchesModule],
  controllers: [MerchantPromotionsController, AdminPromotionsController],
  providers: [
    PromotionsRepository,
    PromotionPricingService,
    MerchantPromotionsService,
    AdminPromotionsService,
  ],
  exports: [
    PromotionsRepository,
    PromotionPricingService,
    MerchantPromotionsService,
  ],
})
export class PromotionsModule {}
