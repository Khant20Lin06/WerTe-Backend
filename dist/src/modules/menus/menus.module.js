"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../audit/audit.module");
const branches_module_1 = require("../branches/branches.module");
const notifications_module_1 = require("../notifications/notifications.module");
const customer_catalog_controller_1 = require("./controllers/customer-catalog.controller");
const merchant_inventory_controller_1 = require("./controllers/merchant-inventory.controller");
const merchant_menu_categories_controller_1 = require("./controllers/merchant-menu-categories.controller");
const merchant_menu_item_inventory_lots_controller_1 = require("./controllers/merchant-menu-item-inventory-lots.controller");
const merchant_menu_items_controller_1 = require("./controllers/merchant-menu-items.controller");
const merchant_menu_option_groups_controller_1 = require("./controllers/merchant-menu-option-groups.controller");
const merchant_menu_options_controller_1 = require("./controllers/merchant-menu-options.controller");
const merchant_menu_scope_controller_1 = require("./controllers/merchant-menu-scope.controller");
const merchant_menu_variant_combinations_controller_1 = require("./controllers/merchant-menu-variant-combinations.controller");
const menu_category_policy_service_1 = require("./policies/menu-category-policy.service");
const menu_item_policy_service_1 = require("./policies/menu-item-policy.service");
const menu_option_group_policy_service_1 = require("./policies/menu-option-group-policy.service");
const menu_option_policy_service_1 = require("./policies/menu-option-policy.service");
const menus_repository_1 = require("./repositories/menus.repository");
const customer_catalog_read_service_1 = require("./services/customer-catalog-read.service");
const merchant_catalog_read_service_1 = require("./services/merchant-catalog-read.service");
const merchant_inventory_read_service_1 = require("./services/merchant-inventory-read.service");
const merchant_menu_categories_service_1 = require("./services/merchant-menu-categories.service");
const menu_item_inventory_service_1 = require("./services/menu-item-inventory.service");
const merchant_menu_items_service_1 = require("./services/merchant-menu-items.service");
const merchant_menu_item_inventory_lots_service_1 = require("./services/merchant-menu-item-inventory-lots.service");
const merchant_menu_option_groups_service_1 = require("./services/merchant-menu-option-groups.service");
const merchant_menu_options_service_1 = require("./services/merchant-menu-options.service");
const merchant_menu_variant_combinations_service_1 = require("./services/merchant-menu-variant-combinations.service");
const menu_inventory_lifecycle_service_1 = require("./services/menu-inventory-lifecycle.service");
const menus_service_1 = require("./services/menus.service");
let MenusModule = class MenusModule {
};
exports.MenusModule = MenusModule;
exports.MenusModule = MenusModule = __decorate([
    (0, common_1.Module)({
        imports: [branches_module_1.BranchesModule, audit_module_1.AuditModule, notifications_module_1.NotificationsModule],
        controllers: [
            customer_catalog_controller_1.CustomerCatalogController,
            merchant_inventory_controller_1.MerchantInventoryController,
            merchant_menu_categories_controller_1.MerchantMenuCategoriesController,
            merchant_menu_item_inventory_lots_controller_1.MerchantMenuItemInventoryLotsController,
            merchant_menu_items_controller_1.MerchantMenuItemsController,
            merchant_menu_option_groups_controller_1.MerchantMenuOptionGroupsController,
            merchant_menu_options_controller_1.MerchantMenuOptionsController,
            merchant_menu_variant_combinations_controller_1.MerchantMenuVariantCombinationsController,
            merchant_menu_scope_controller_1.MerchantMenuScopeController,
        ],
        providers: [
            menus_repository_1.MenusRepository,
            menus_service_1.MenusService,
            merchant_catalog_read_service_1.MerchantCatalogReadService,
            merchant_inventory_read_service_1.MerchantInventoryReadService,
            customer_catalog_read_service_1.CustomerCatalogReadService,
            merchant_menu_categories_service_1.MerchantMenuCategoriesService,
            menu_category_policy_service_1.MenuCategoryPolicyService,
            menu_item_inventory_service_1.MenuItemInventoryService,
            merchant_menu_items_service_1.MerchantMenuItemsService,
            merchant_menu_item_inventory_lots_service_1.MerchantMenuItemInventoryLotsService,
            menu_item_policy_service_1.MenuItemPolicyService,
            merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService,
            menu_option_group_policy_service_1.MenuOptionGroupPolicyService,
            merchant_menu_options_service_1.MerchantMenuOptionsService,
            menu_option_policy_service_1.MenuOptionPolicyService,
            merchant_menu_variant_combinations_service_1.MerchantMenuVariantCombinationsService,
            menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService,
        ],
        exports: [
            menus_service_1.MenusService,
            menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService,
            merchant_catalog_read_service_1.MerchantCatalogReadService,
            merchant_inventory_read_service_1.MerchantInventoryReadService,
            customer_catalog_read_service_1.CustomerCatalogReadService,
            merchant_menu_categories_service_1.MerchantMenuCategoriesService,
            menu_category_policy_service_1.MenuCategoryPolicyService,
            merchant_menu_items_service_1.MerchantMenuItemsService,
            merchant_menu_item_inventory_lots_service_1.MerchantMenuItemInventoryLotsService,
            menu_item_policy_service_1.MenuItemPolicyService,
            merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService,
            menu_option_group_policy_service_1.MenuOptionGroupPolicyService,
            merchant_menu_options_service_1.MerchantMenuOptionsService,
            menu_option_policy_service_1.MenuOptionPolicyService,
            merchant_menu_variant_combinations_service_1.MerchantMenuVariantCombinationsService,
        ],
    })
], MenusModule);
//# sourceMappingURL=menus.module.js.map