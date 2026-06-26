"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const branch_catalog_entity_1 = require("../entities/branch-catalog.entity");
const item_option_group_ownership_entity_1 = require("../entities/item-option-group-ownership.entity");
const item_option_ownership_entity_1 = require("../entities/item-option-ownership.entity");
const item_variant_combination_ownership_entity_1 = require("../entities/item-variant-combination-ownership.entity");
const menu_item_inventory_lot_entity_1 = require("../entities/menu-item-inventory-lot.entity");
const menu_category_ownership_entity_1 = require("../entities/menu-category-ownership.entity");
const menu_item_ownership_entity_1 = require("../entities/menu-item-ownership.entity");
const menus_repository_1 = require("../repositories/menus.repository");
const item_variant_combination_util_1 = require("../utils/item-variant-combination.util");
let MenusService = class MenusService {
    constructor(menusRepository) {
        this.menusRepository = menusRepository;
    }
    findCategoryById(id) {
        return this.menusRepository.findCategoryById(id);
    }
    listCategoriesByBranchId(branchId) {
        return this.menusRepository.listCategoriesByBranchId(branchId);
    }
    findItemById(id) {
        return this.menusRepository.findItemById(id);
    }
    listItemsByBranchId(branchId) {
        return this.menusRepository.listItemsByBranchId(branchId);
    }
    listItemsByIds(ids) {
        return this.menusRepository.listItemsByIds(ids);
    }
    findOptionGroupById(id) {
        return this.menusRepository.findOptionGroupById(id);
    }
    listOptionGroupsByMenuItemId(menuItemId) {
        return this.menusRepository.listOptionGroupsByMenuItemId(menuItemId);
    }
    findOptionById(id) {
        return this.menusRepository.findOptionById(id);
    }
    listOptionsByOptionGroupId(optionGroupId) {
        return this.menusRepository.listOptionsByOptionGroupId(optionGroupId);
    }
    listOptionsByBranchId(branchId) {
        return this.menusRepository.listOptionsByBranchId(branchId);
    }
    findVariantCombinationById(id) {
        return this.menusRepository.findVariantCombinationById(id);
    }
    listVariantCombinationsByMenuItemId(menuItemId) {
        return this.menusRepository.listVariantCombinationsByMenuItemId(menuItemId);
    }
    listVariantCombinationsByMenuItemIds(menuItemIds) {
        return this.menusRepository.listVariantCombinationsByMenuItemIds(menuItemIds);
    }
    findItemInventoryLotById(id) {
        return this.menusRepository.findItemInventoryLotById(id);
    }
    listItemInventoryLotsByMenuItemId(menuItemId) {
        return this.menusRepository.listItemInventoryLotsByMenuItemId(menuItemId);
    }
    findActiveVariantCombinationByMenuItemIdAndOptionIds(menuItemId, optionIds) {
        const signature = (0, item_variant_combination_util_1.buildVariantCombinationSignature)(optionIds);
        if (signature.length === 0) {
            return Promise.resolve(null);
        }
        return this.menusRepository.findActiveVariantCombinationByMenuItemIdAndSignature(menuItemId, signature);
    }
    findBranchCatalogByBranchId(branchId) {
        return this.menusRepository.findBranchCatalogByBranchId(branchId);
    }
    async findCategoryOwnedByUserId(userId, categoryId) {
        const category = await this.findCategoryById(categoryId);
        if (category === null || !this.categoryBelongsToMerchantUser(category, userId)) {
            return null;
        }
        return category;
    }
    async findItemOwnedByUserId(userId, itemId) {
        const item = await this.findItemById(itemId);
        if (item === null || !this.itemBelongsToMerchantUser(item, userId)) {
            return null;
        }
        return item;
    }
    async findOptionGroupOwnedByUserId(userId, optionGroupId) {
        const group = await this.findOptionGroupById(optionGroupId);
        if (group === null || !this.optionGroupBelongsToMerchantUser(group, userId)) {
            return null;
        }
        return group;
    }
    async findOptionOwnedByUserId(userId, optionId) {
        const option = await this.findOptionById(optionId);
        if (option === null || !this.optionBelongsToMerchantUser(option, userId)) {
            return null;
        }
        return option;
    }
    async findOwnedBranchCatalogByUserId(userId, branchId) {
        const branchCatalog = await this.findBranchCatalogByBranchId(branchId);
        if (branchCatalog === null ||
            !this.branchCatalogBelongsToMerchantUser(branchCatalog, userId)) {
            return null;
        }
        return branchCatalog;
    }
    buildCategoryOwnership(category) {
        return (0, menu_category_ownership_entity_1.buildMenuCategoryOwnership)(category);
    }
    buildItemOwnership(item) {
        return (0, menu_item_ownership_entity_1.buildMenuItemOwnership)(item);
    }
    buildOptionGroupOwnership(group) {
        return (0, item_option_group_ownership_entity_1.buildItemOptionGroupOwnership)(group);
    }
    buildOptionOwnership(option) {
        return (0, item_option_ownership_entity_1.buildItemOptionOwnership)(option);
    }
    buildVariantCombinationOwnership(combination) {
        return (0, item_variant_combination_ownership_entity_1.buildItemVariantCombinationOwnership)(combination);
    }
    buildItemInventoryLot(lot) {
        return (0, menu_item_inventory_lot_entity_1.buildMenuItemInventoryLot)(lot);
    }
    buildBranchCatalog(branch, options) {
        return (0, branch_catalog_entity_1.buildBranchCatalog)(branch, options);
    }
    categoryBelongsToMerchantUser(category, userId) {
        return category.branch.merchant.user.id === userId;
    }
    itemBelongsToMerchantUser(item, userId) {
        return item.branch.merchant.user.id === userId;
    }
    optionGroupBelongsToMerchantUser(group, userId) {
        return group.menuItem.branch.merchant.user.id === userId;
    }
    optionBelongsToMerchantUser(option, userId) {
        return option.group.menuItem.branch.merchant.user.id === userId;
    }
    branchCatalogBelongsToMerchantUser(branchCatalog, userId) {
        return branchCatalog.merchant.user.id === userId;
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menus_repository_1.MenusRepository])
], MenusService);
//# sourceMappingURL=menus.service.js.map