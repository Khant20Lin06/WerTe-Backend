import { Module } from '@nestjs/common';

import { DeliveriesModule } from '../deliveries/deliveries.module';
import { RatingsModule } from '../ratings/ratings.module';
import { UploadsModule } from '../uploads/uploads.module';
import { AdminRidersController } from './controllers/admin-riders.controller';
import { RiderAvailabilityController } from './controllers/rider-availability.controller';
import { RiderLocationController } from './controllers/rider-location.controller';
import { RiderProfileController } from './controllers/rider-profile.controller';
import { RiderPolicyService } from './policies/rider-policy.service';
import { RidersRepository } from './repositories/riders.repository';
import { AdminRiderManagementService } from './services/admin-rider-management.service';
import { RiderAccountService } from './services/rider-account.service';
import { RiderAvailabilityService } from './services/rider-availability.service';
import { RiderLocationService } from './services/rider-location.service';
import { RidersService } from './services/riders.service';

@Module({
  imports: [DeliveriesModule, RatingsModule, UploadsModule],
  controllers: [
    RiderProfileController,
    RiderAvailabilityController,
    RiderLocationController,
    AdminRidersController,
  ],
  providers: [
    RidersRepository,
    RidersService,
    RiderAccountService,
    RiderAvailabilityService,
    RiderLocationService,
    RiderPolicyService,
    AdminRiderManagementService,
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
