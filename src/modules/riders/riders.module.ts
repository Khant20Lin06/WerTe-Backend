import { Module } from '@nestjs/common';

import { DeliveriesModule } from '../deliveries/deliveries.module';
import { RiderAvailabilityController } from './controllers/rider-availability.controller';
import { RiderLocationController } from './controllers/rider-location.controller';
import { RiderProfileController } from './controllers/rider-profile.controller';
import { RiderPolicyService } from './policies/rider-policy.service';
import { RidersRepository } from './repositories/riders.repository';
import { RiderAccountService } from './services/rider-account.service';
import { RiderAvailabilityService } from './services/rider-availability.service';
import { RiderLocationService } from './services/rider-location.service';
import { RidersService } from './services/riders.service';

@Module({
  imports: [DeliveriesModule],
  controllers: [
    RiderProfileController,
    RiderAvailabilityController,
    RiderLocationController,
  ],
  providers: [
    RidersRepository,
    RidersService,
    RiderAccountService,
    RiderAvailabilityService,
    RiderLocationService,
    RiderPolicyService,
  ],
  exports: [
    RidersService,
    RiderAccountService,
    RiderAvailabilityService,
    RiderLocationService,
    RiderPolicyService,
  ],
})
export class RidersModule {}
