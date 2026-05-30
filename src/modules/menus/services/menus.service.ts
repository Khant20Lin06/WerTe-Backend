import { Injectable } from '@nestjs/common';

import {
  BranchCatalogEntity,
  BranchCatalogRecord,
  buildBranchCatalog,
} from '../entities/branch-catalog.entity';
import {
  buildItemOptionGroupOwnership,
  ItemOptionGroupOwnershipEntity,
  ItemOptionGroupOwnershipRecord,
} from '../entities/item-option-group-ownership.entity';
import {
  buildItemOptionOwnership,
  ItemOptionOwnershipEntity,
  ItemOptionOwnershipRecord,
} from '../entities/item-option-ownership.entity';
import {
  buildItemVariantCombinationOwnership,
  ItemVariantCombinationOwnershipEntity,
  ItemVariantCombinationOwnershipRecord,
} from '../entities/item-variant-combination-ownership.entity';
import {
  buildMenuItemInventoryLot,
  MenuItemInventoryLotEntity,
  MenuItemInventoryLotRecord,
} from '../entities/menu-item-inventory-lot.entity';
import {
  buildMenuCategoryOwnership,
  MenuCategoryOwnershipEntity,
  MenuCategoryOwnershipRecord,
} from '../entities/menu-category-ownership.entity';
import {
  buildMenuItemOwnership,
  MenuItemOwnershipEntity,
  MenuItemOwnershipRecord,
} from '../entities/menu-item-ownership.entity';
import { MenusRepository } from '../repositories/menus.repository';
import { buildVariantCombinationSignature } from '../utils/item-variant-combination.util';

@Injectable()
export class MenusService {
  constructor(private readonly menusRepository: MenusRepository) {}

  findCategoryById(id: string): Promise<MenuCategoryOwnershipRecord | null> {
    return this.menusRepository.findCategoryById(id);
  }

  listCategoriesByBranchId(
    branchId: string,
  ): Promise<MenuCategoryOwnershipRecord[]> {
    return this.menusRepository.listCategoriesByBranchId(branchId);
  }

  findItemById(id: string): Promise<MenuItemOwnershipRecord | null> {
    return this.menusRepository.findItemById(id);
  }

  listItemsByBranchId(branchId: string): Promise<MenuItemOwnershipRecord[]> {
    return this.menusRepository.listItemsByBranchId(branchId);
  }

  findOptionGroupById(
    id: string,
  ): Promise<ItemOptionGroupOwnershipRecord | null> {
    return this.menusRepository.findOptionGroupById(id);
  }

  listOptionGroupsByMenuItemId(
    menuItemId: string,
  ): Promise<ItemOptionGroupOwnershipRecord[]> {
    return this.menusRepository.listOptionGroupsByMenuItemId(menuItemId);
  }

  findOptionById(id: string): Promise<ItemOptionOwnershipRecord | null> {
    return this.menusRepository.findOptionById(id);
  }

  listOptionsByOptionGroupId(
    optionGroupId: string,
  ): Promise<ItemOptionOwnershipRecord[]> {
    return this.menusRepository.listOptionsByOptionGroupId(optionGroupId);
  }

  listOptionsByBranchId(branchId: string): Promise<ItemOptionOwnershipRecord[]> {
    return this.menusRepository.listOptionsByBranchId(branchId);
  }

  findVariantCombinationById(
    id: string,
  ): Promise<ItemVariantCombinationOwnershipRecord | null> {
    return this.menusRepository.findVariantCombinationById(id);
  }

  listVariantCombinationsByMenuItemId(
    menuItemId: string,
  ): Promise<ItemVariantCombinationOwnershipRecord[]> {
    return this.menusRepository.listVariantCombinationsByMenuItemId(menuItemId);
  }

  findItemInventoryLotById(
    id: string,
  ): Promise<MenuItemInventoryLotRecord | null> {
    return this.menusRepository.findItemInventoryLotById(id);
  }

  listItemInventoryLotsByMenuItemId(
    menuItemId: string,
  ): Promise<MenuItemInventoryLotRecord[]> {
    return this.menusRepository.listItemInventoryLotsByMenuItemId(menuItemId);
  }

  findActiveVariantCombinationByMenuItemIdAndOptionIds(
    menuItemId: string,
    optionIds: string[],
  ): Promise<ItemVariantCombinationOwnershipRecord | null> {
    const signature = buildVariantCombinationSignature(optionIds);

    if (signature.length === 0) {
      return Promise.resolve(null);
    }

    return this.menusRepository.findActiveVariantCombinationByMenuItemIdAndSignature(
      menuItemId,
      signature,
    );
  }

  findBranchCatalogByBranchId(
    branchId: string,
  ): Promise<BranchCatalogRecord | null> {
    return this.menusRepository.findBranchCatalogByBranchId(branchId);
  }

  async findCategoryOwnedByUserId(
    userId: string,
    categoryId: string,
  ): Promise<MenuCategoryOwnershipRecord | null> {
    const category = await this.findCategoryById(categoryId);
    if (category === null || !this.categoryBelongsToMerchantUser(category, userId)) {
      return null;
    }

    return category;
  }

  async findItemOwnedByUserId(
    userId: string,
    itemId: string,
  ): Promise<MenuItemOwnershipRecord | null> {
    const item = await this.findItemById(itemId);
    if (item === null || !this.itemBelongsToMerchantUser(item, userId)) {
      return null;
    }

    return item;
  }

  async findOptionGroupOwnedByUserId(
    userId: string,
    optionGroupId: string,
  ): Promise<ItemOptionGroupOwnershipRecord | null> {
    const group = await this.findOptionGroupById(optionGroupId);
    if (group === null || !this.optionGroupBelongsToMerchantUser(group, userId)) {
      return null;
    }

    return group;
  }

  async findOptionOwnedByUserId(
    userId: string,
    optionId: string,
  ): Promise<ItemOptionOwnershipRecord | null> {
    const option = await this.findOptionById(optionId);
    if (option === null || !this.optionBelongsToMerchantUser(option, userId)) {
      return null;
    }

    return option;
  }

  async findOwnedBranchCatalogByUserId(
    userId: string,
    branchId: string,
  ): Promise<BranchCatalogRecord | null> {
    const branchCatalog = await this.findBranchCatalogByBranchId(branchId);
    if (
      branchCatalog === null ||
      !this.branchCatalogBelongsToMerchantUser(branchCatalog, userId)
    ) {
      return null;
    }

    return branchCatalog;
  }

  buildCategoryOwnership(
    category: MenuCategoryOwnershipRecord,
  ): MenuCategoryOwnershipEntity {
    return buildMenuCategoryOwnership(category);
  }

  buildItemOwnership(item: MenuItemOwnershipRecord): MenuItemOwnershipEntity {
    return buildMenuItemOwnership(item);
  }

  buildOptionGroupOwnership(
    group: ItemOptionGroupOwnershipRecord,
  ): ItemOptionGroupOwnershipEntity {
    return buildItemOptionGroupOwnership(group);
  }

  buildOptionOwnership(option: ItemOptionOwnershipRecord): ItemOptionOwnershipEntity {
    return buildItemOptionOwnership(option);
  }

  buildVariantCombinationOwnership(
    combination: ItemVariantCombinationOwnershipRecord,
  ): ItemVariantCombinationOwnershipEntity {
    return buildItemVariantCombinationOwnership(combination);
  }

  buildItemInventoryLot(
    lot: MenuItemInventoryLotRecord,
  ): MenuItemInventoryLotEntity {
    return buildMenuItemInventoryLot(lot);
  }

  buildBranchCatalog(
    branch: BranchCatalogRecord,
    options?: { activeOnly?: boolean; storeTypeCode?: string },
  ): BranchCatalogEntity {
    return buildBranchCatalog(branch, options);
  }

  categoryBelongsToMerchantUser(
    category: MenuCategoryOwnershipRecord,
    userId: string,
  ): boolean {
    return category.branch.merchant.user.id === userId;
  }

  itemBelongsToMerchantUser(
    item: MenuItemOwnershipRecord,
    userId: string,
  ): boolean {
    return item.branch.merchant.user.id === userId;
  }

  optionGroupBelongsToMerchantUser(
    group: ItemOptionGroupOwnershipRecord,
    userId: string,
  ): boolean {
    return group.menuItem.branch.merchant.user.id === userId;
  }

  optionBelongsToMerchantUser(
    option: ItemOptionOwnershipRecord,
    userId: string,
  ): boolean {
    return option.group.menuItem.branch.merchant.user.id === userId;
  }

  branchCatalogBelongsToMerchantUser(
    branchCatalog: BranchCatalogRecord,
    userId: string,
  ): boolean {
    return branchCatalog.merchant.user.id === userId;
  }
}
