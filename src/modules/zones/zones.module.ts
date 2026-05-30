import { Module } from '@nestjs/common';

import { AdminZonesController } from './controllers/admin-zones.controller';
import { MerchantZonesController } from './controllers/merchant-zones.controller';
import { ZonePolicyService } from './policies/zone-policy.service';
import { ZonesRepository } from './repositories/zones.repository';
import { ZoneManagementService } from './services/zone-management.service';
import { ZonesService } from './services/zones.service';

@Module({
  controllers: [AdminZonesController, MerchantZonesController],
  providers: [
    ZonesRepository,
    ZonesService,
    ZoneManagementService,
    ZonePolicyService,
  ],
  exports: [ZonesService, ZoneManagementService, ZonePolicyService],
})
export class ZonesModule {}
