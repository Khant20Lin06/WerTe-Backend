import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { MenusModule } from '../menus/menus.module';
import { AdminBranchStoreTypesController } from './controllers/admin-branch-store-types.controller';
import { AdminStoreTypesController } from './controllers/admin-store-types.controller';
import { CustomerStoresController } from './controllers/customer-stores.controller';
import { MerchantStoreTypesController } from './controllers/merchant-store-types.controller';
import { StoreTypePolicyService } from './policies/store-type-policy.service';
import { StoreTypesRepository } from './repositories/store-types.repository';
import { CustomerStoreDiscoveryService } from './services/customer-store-discovery.service';
import { MerchantStoreTypeRequestService } from './services/merchant-store-type-request.service';
import { StoreTypeManagementService } from './services/store-type-management.service';

@Module({
  imports: [AuditModule, MenusModule],
  controllers: [
    AdminStoreTypesController,
    AdminBranchStoreTypesController,
    MerchantStoreTypesController,
    CustomerStoresController,
  ],
  providers: [
    StoreTypesRepository,
    StoreTypeManagementService,
    CustomerStoreDiscoveryService,
    MerchantStoreTypeRequestService,
    StoreTypePolicyService,
  ],
  exports: [
    StoreTypesRepository,
    StoreTypeManagementService,
    CustomerStoreDiscoveryService,
    MerchantStoreTypeRequestService,
    StoreTypePolicyService,
  ],
})
export class StoreTypesModule {}
