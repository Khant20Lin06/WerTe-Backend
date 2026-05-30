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
exports.MenusRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const branch_catalog_entity_1 = require("../entities/branch-catalog.entity");
const item_option_group_ownership_entity_1 = require("../entities/item-option-group-ownership.entity");
const item_option_ownership_entity_1 = require("../entities/item-option-ownership.entity");
const menu_category_ownership_entity_1 = require("../entities/menu-category-ownership.entity");
const menu_item_ownership_entity_1 = require("../entities/menu-item-ownership.entity");
let MenusRepository = class MenusRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findCategoryById(id) {
        return this.prisma.menuCategory.findUnique({
            where: { id },
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    listCategoriesByBranchId(branchId) {
        return this.prisma.menuCategory.findMany({
            where: { branchId },
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createCategory(data, client = this.prisma) {
        return client.menuCategory.create({
            data,
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    updateCategory(id, data, client = this.prisma) {
        return client.menuCategory.update({
            where: { id },
            data,
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    findHighestCategorySortOrderByBranchId(branchId, client = this.prisma) {
        return client.menuCategory.findFirst({
            where: { branchId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findItemById(id) {
        return this.prisma.menuItem.findUnique({
            where: { id },
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    listItemsByBranchId(branchId) {
        return this.prisma.menuItem.findMany({
            where: { branchId },
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createItem(data, client = this.prisma) {
        return client.menuItem.create({
            data,
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    updateItem(id, data, client = this.prisma) {
        return client.menuItem.update({
            where: { id },
            data,
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    findHighestItemSortOrderByBranchId(branchId, client = this.prisma) {
        return client.menuItem.findFirst({
            where: { branchId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findOptionGroupById(id) {
        return this.prisma.itemOptionGroup.findUnique({
            where: { id },
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    listOptionGroupsByMenuItemId(menuItemId) {
        return this.prisma.itemOptionGroup.findMany({
            where: { menuItemId },
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createOptionGroup(data, client = this.prisma) {
        return client.itemOptionGroup.create({
            data,
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    updateOptionGroup(id, data, client = this.prisma) {
        return client.itemOptionGroup.update({
            where: { id },
            data,
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    findHighestOptionGroupSortOrderByMenuItemId(menuItemId, client = this.prisma) {
        return client.itemOptionGroup.findFirst({
            where: { menuItemId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findOptionById(id) {
        return this.prisma.itemOption.findUnique({
            where: { id },
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
    listOptionsByOptionGroupId(optionGroupId) {
        return this.prisma.itemOption.findMany({
            where: { groupId: optionGroupId },
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createOption(data, client = this.prisma) {
        return client.itemOption.create({
            data,
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
    updateOption(id, data, client = this.prisma) {
        return client.itemOption.update({
            where: { id },
            data,
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
    findHighestOptionSortOrderByOptionGroupId(optionGroupId, client = this.prisma) {
        return client.itemOption.findFirst({
            where: { groupId: optionGroupId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findBranchCatalogByBranchId(branchId) {
        return this.prisma.branch.findUnique({
            where: { id: branchId },
            include: branch_catalog_entity_1.branchCatalogInclude,
        });
    }
};
exports.MenusRepository = MenusRepository;
exports.MenusRepository = MenusRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusRepository);
//# sourceMappingURL=menus.repository.js.map