import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { BranchesModule } from '../branches/branches.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CustomerCatalogController } from './controllers/customer-catalog.controller';
import { MerchantInventoryController } from './controllers/merchant-inventory.controller';
import { MerchantMenuCategoriesController } from './controllers/merchant-menu-categories.controller';
import { MerchantMenuItemInventoryLotsController } from './controllers/merchant-menu-item-inventory-lots.controller';
import { MerchantMenuItemsController } from './controllers/merchant-menu-items.controller';
import { MerchantMenuOptionGroupsController } from './controllers/merchant-menu-option-groups.controller';
import { MerchantMenuOptionsController } from './controllers/merchant-menu-options.controller';
import { MerchantMenuScopeController } from './controllers/merchant-menu-scope.controller';
import { MerchantMenuVariantCombinationsController } from './controllers/merchant-menu-variant-combinations.controller';
import { MenuCategoryPolicyService } from './policies/menu-category-policy.service';
import { MenuItemPolicyService } from './policies/menu-item-policy.service';
import { MenuOptionGroupPolicyService } from './policies/menu-option-group-policy.service';
import { MenuOptionPolicyService } from './policies/menu-option-policy.service';
import { MenusRepository } from './repositories/menus.repository';
import { CustomerCatalogReadService } from './services/customer-catalog-read.service';
import { MenuCacheService } from './services/menu-cache.service';
import { MerchantCatalogReadService } from './services/merchant-catalog-read.service';
import { MerchantInventoryReadService } from './services/merchant-inventory-read.service';
import { MerchantMenuCategoriesService } from './services/merchant-menu-categories.service';
import { MenuItemInventoryService } from './services/menu-item-inventory.service';
import { MerchantMenuItemsService } from './services/merchant-menu-items.service';
import { MerchantMenuItemInventoryLotsService } from './services/merchant-menu-item-inventory-lots.service';
import { MerchantMenuOptionGroupsService } from './services/merchant-menu-option-groups.service';
import { MerchantMenuOptionsService } from './services/merchant-menu-options.service';
import { MerchantMenuVariantCombinationsService } from './services/merchant-menu-variant-combinations.service';
import { MenuInventoryLifecycleService } from './services/menu-inventory-lifecycle.service';
import { MenusService } from './services/menus.service';

@Module({
  imports: [BranchesModule, AuditModule, NotificationsModule],
  controllers: [
    CustomerCatalogController,
    MerchantInventoryController,
    MerchantMenuCategoriesController,
    MerchantMenuItemInventoryLotsController,
    MerchantMenuItemsController,
    MerchantMenuOptionGroupsController,
    MerchantMenuOptionsController,
    MerchantMenuVariantCombinationsController,
    MerchantMenuScopeController,
  ],
  providers: [
    MenusRepository,
    MenusService,
    MenuCacheService,
    MerchantCatalogReadService,
    MerchantInventoryReadService,
    CustomerCatalogReadService,
    MerchantMenuCategoriesService,
    MenuCategoryPolicyService,
    MenuItemInventoryService,
    MerchantMenuItemsService,
    MerchantMenuItemInventoryLotsService,
    MenuItemPolicyService,
    MerchantMenuOptionGroupsService,
    MenuOptionGroupPolicyService,
    MerchantMenuOptionsService,
    MenuOptionPolicyService,
    MerchantMenuVariantCombinationsService,
    MenuInventoryLifecycleService,
  ],
  exports: [
    MenusService,
    MenuCacheService,
    MenuInventoryLifecycleService,
    MerchantCatalogReadService,
    MerchantInventoryReadService,
    CustomerCatalogReadService,
    MerchantMenuCategoriesService,
    MenuCategoryPolicyService,
    MerchantMenuItemsService,
    MerchantMenuItemInventoryLotsService,
    MenuItemPolicyService,
    MerchantMenuOptionGroupsService,
    MenuOptionGroupPolicyService,
    MerchantMenuOptionsService,
    MenuOptionPolicyService,
    MerchantMenuVariantCombinationsService,
  ],
})
export class MenusModule {}
