import { Module } from '@nestjs/common';

import { AdminRatingsController } from './controllers/admin-ratings.controller';
import { CustomerRatingsController } from './controllers/customer-ratings.controller';
import { MerchantRatingsController } from './controllers/merchant-ratings.controller';
import { RiderRatingsController } from './controllers/rider-ratings.controller';
import { RatingsRepository } from './repositories/ratings.repository';
import { RatingsService } from './ratings.service';

@Module({
  controllers: [AdminRatingsController, CustomerRatingsController, MerchantRatingsController, RiderRatingsController],
  providers: [RatingsService, RatingsRepository],
  exports: [RatingsService],
})
export class RatingsModule {}
