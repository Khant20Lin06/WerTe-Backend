import { Injectable } from '@nestjs/common';
import { BranchStoreTypeStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  BranchCatalogRecord,
  branchCatalogInclude,
} from '../entities/branch-catalog.entity';
import {
  ItemOptionGroupOwnershipRecord,
  itemOptionGroupOwnershipInclude,
} from '../entities/item-option-group-ownership.entity';
import {
  ItemOptionOwnershipRecord,
  itemOptionOwnershipInclude,
} from '../entities/item-option-ownership.entity';
import {
  ItemVariantCombinationOwnershipRecord,
  itemVariantCombinationOwnershipInclude,
} from '../entities/item-variant-combination-ownership.entity';
import {
  MenuItemInventoryLotRecord,
  menuItemInventoryLotInclude,
} from '../entities/menu-item-inventory-lot.entity';
import {
  MenuCategoryOwnershipRecord,
  menuCategoryOwnershipInclude,
} from '../entities/menu-category-ownership.entity';
import {
  MenuItemOwnershipRecord,
  menuItemOwnershipInclude,
} from '../entities/menu-item-ownership.entity';

type MenuDatabaseClient = PrismaService | Prisma.TransactionClient;

const approvedBranchStoreTypeInclude =
  Prisma.validator<Prisma.BranchStoreTypeInclude>()({
    storeType: {
      select: {
        id: true,
        code: true,
        name: true,
        sortOrder: true,
      },
    },
  });

export type ApprovedBranchStoreTypeRecord = Prisma.BranchStoreTypeGetPayload<{
  include: typeof approvedBranchStoreTypeInclude;
}>;

@Injectable()
export class MenusRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCategoryById(
    id: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuCategoryOwnershipRecord | null> {
    return client.menuCategory.findUnique({
      where: { id },
      include: menuCategoryOwnershipInclude,
    });
  }

  listCategoriesByBranchId(
    branchId: string,
  ): Promise<MenuCategoryOwnershipRecord[]> {
    return this.prisma.menuCategory.findMany({
      where: { branchId },
      include: menuCategoryOwnershipInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createCategory(
    data: Prisma.MenuCategoryUncheckedCreateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuCategoryOwnershipRecord> {
    return client.menuCategory.create({
      data,
      include: menuCategoryOwnershipInclude,
    });
  }

  updateCategory(
    id: string,
    data: Prisma.MenuCategoryUpdateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuCategoryOwnershipRecord> {
    return client.menuCategory.update({
      where: { id },
      data,
      include: menuCategoryOwnershipInclude,
    });
  }

  findHighestCategorySortOrderByBranchId(
    branchId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<{ sortOrder: number } | null> {
    return client.menuCategory.findFirst({
      where: { branchId },
      select: {
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findItemById(
    id: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemOwnershipRecord | null> {
    return client.menuItem.findUnique({
      where: { id },
      include: menuItemOwnershipInclude,
    });
  }

  listItemsByBranchId(branchId: string): Promise<MenuItemOwnershipRecord[]> {
    return this.prisma.menuItem.findMany({
      where: { branchId },
      include: menuItemOwnershipInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createItem(
    data: Prisma.MenuItemUncheckedCreateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemOwnershipRecord> {
    return client.menuItem.create({
      data,
      include: menuItemOwnershipInclude,
    });
  }

  updateItem(
    id: string,
    data: Prisma.MenuItemUpdateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemOwnershipRecord> {
    return client.menuItem.update({
      where: { id },
      data,
      include: menuItemOwnershipInclude,
    });
  }

  async decrementTrackedItemStock(
    itemId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    const result = await client.menuItem.updateMany({
      where: {
        id: itemId,
        isStockTracked: true,
        stockQuantity: {
          not: null,
          gte: quantity,
        },
      },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });

    return result.count > 0;
  }

  async adjustTrackedItemStock(
    itemId: string,
    delta: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    if (delta === 0) {
      return true;
    }

    const result = await client.menuItem.updateMany({
      where: {
        id: itemId,
        isStockTracked: true,
        stockQuantity:
          delta < 0
            ? {
                not: null,
                gte: Math.abs(delta),
              }
            : {
                not: null,
              },
      },
      data: {
        stockQuantity:
          delta < 0
            ? {
                decrement: Math.abs(delta),
              }
            : {
                increment: delta,
              },
      },
    });

    return result.count > 0;
  }

  incrementItemStock(
    itemId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.$executeRaw`
      UPDATE "MenuItem"
      SET "stockQuantity" = COALESCE("stockQuantity", 0) + ${quantity}
      WHERE "id" = ${itemId}
    `;
  }

  findHighestItemSortOrderByBranchId(
    branchId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<{ sortOrder: number } | null> {
    return client.menuItem.findFirst({
      where: { branchId },
      select: {
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findOptionGroupById(
    id: string,
  ): Promise<ItemOptionGroupOwnershipRecord | null> {
    return this.prisma.itemOptionGroup.findUnique({
      where: { id },
      include: itemOptionGroupOwnershipInclude,
    });
  }

  listOptionGroupsByMenuItemId(
    menuItemId: string,
  ): Promise<ItemOptionGroupOwnershipRecord[]> {
    return this.prisma.itemOptionGroup.findMany({
      where: { menuItemId },
      include: itemOptionGroupOwnershipInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createOptionGroup(
    data: Prisma.ItemOptionGroupUncheckedCreateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemOptionGroupOwnershipRecord> {
    return client.itemOptionGroup.create({
      data,
      include: itemOptionGroupOwnershipInclude,
    });
  }

  updateOptionGroup(
    id: string,
    data: Prisma.ItemOptionGroupUpdateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemOptionGroupOwnershipRecord> {
    return client.itemOptionGroup.update({
      where: { id },
      data,
      include: itemOptionGroupOwnershipInclude,
    });
  }

  findHighestOptionGroupSortOrderByMenuItemId(
    menuItemId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<{ sortOrder: number } | null> {
    return client.itemOptionGroup.findFirst({
      where: { menuItemId },
      select: {
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findOptionById(
    id: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemOptionOwnershipRecord | null> {
    return client.itemOption.findUnique({
      where: { id },
      include: itemOptionOwnershipInclude,
    });
  }

  listOptionsByOptionGroupId(
    optionGroupId: string,
  ): Promise<ItemOptionOwnershipRecord[]> {
    return this.prisma.itemOption.findMany({
      where: { groupId: optionGroupId },
      include: itemOptionOwnershipInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listOptionsByBranchId(
    branchId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemOptionOwnershipRecord[]> {
    return client.itemOption.findMany({
      where: {
        group: {
          menuItem: {
            branchId,
          },
        },
      },
      include: itemOptionOwnershipInclude,
      orderBy: [{ groupId: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createOption(
    data: Prisma.ItemOptionUncheckedCreateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemOptionOwnershipRecord> {
    return client.itemOption.create({
      data,
      include: itemOptionOwnershipInclude,
    });
  }

  updateOption(
    id: string,
    data: Prisma.ItemOptionUpdateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemOptionOwnershipRecord> {
    return client.itemOption.update({
      where: { id },
      data,
      include: itemOptionOwnershipInclude,
    });
  }

  async decrementTrackedOptionStock(
    optionId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    const result = await client.itemOption.updateMany({
      where: {
        id: optionId,
        isStockTracked: true,
        stockQuantity: {
          not: null,
          gte: quantity,
        },
      },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });

    return result.count > 0;
  }

  async adjustTrackedOptionStock(
    optionId: string,
    delta: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    if (delta === 0) {
      return true;
    }

    const result = await client.itemOption.updateMany({
      where: {
        id: optionId,
        isStockTracked: true,
        stockQuantity:
          delta < 0
            ? {
                not: null,
                gte: Math.abs(delta),
              }
            : {
                not: null,
              },
      },
      data: {
        stockQuantity:
          delta < 0
            ? {
                decrement: Math.abs(delta),
              }
            : {
                increment: delta,
              },
      },
    });

    return result.count > 0;
  }

  incrementOptionStock(
    optionId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.$executeRaw`
      UPDATE "ItemOption"
      SET "stockQuantity" = COALESCE("stockQuantity", 0) + ${quantity}
      WHERE "id" = ${optionId}
    `;
  }

  findHighestOptionSortOrderByOptionGroupId(
    optionGroupId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<{ sortOrder: number } | null> {
    return client.itemOption.findFirst({
      where: { groupId: optionGroupId },
      select: {
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findVariantCombinationById(
    id: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemVariantCombinationOwnershipRecord | null> {
    return client.itemVariantCombination.findUnique({
      where: { id },
      include: itemVariantCombinationOwnershipInclude,
    });
  }

  listVariantCombinationsByMenuItemId(
    menuItemId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemVariantCombinationOwnershipRecord[]> {
    return client.itemVariantCombination.findMany({
      where: { menuItemId },
      include: itemVariantCombinationOwnershipInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findVariantCombinationByMenuItemIdAndSignature(
    menuItemId: string,
    signature: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemVariantCombinationOwnershipRecord | null> {
    return client.itemVariantCombination.findUnique({
      where: {
        menuItemId_signature: {
          menuItemId,
          signature,
        },
      },
      include: itemVariantCombinationOwnershipInclude,
    });
  }

  findActiveVariantCombinationByMenuItemIdAndSignature(
    menuItemId: string,
    signature: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemVariantCombinationOwnershipRecord | null> {
    return client.itemVariantCombination.findFirst({
      where: {
        menuItemId,
        signature,
        isActive: true,
      },
      include: itemVariantCombinationOwnershipInclude,
    });
  }

  createVariantCombination(
    data: Prisma.ItemVariantCombinationUncheckedCreateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemVariantCombinationOwnershipRecord> {
    return client.itemVariantCombination.create({
      data,
      include: itemVariantCombinationOwnershipInclude,
    });
  }

  updateVariantCombination(
    id: string,
    data: Prisma.ItemVariantCombinationUpdateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ItemVariantCombinationOwnershipRecord> {
    return client.itemVariantCombination.update({
      where: { id },
      data,
      include: itemVariantCombinationOwnershipInclude,
    });
  }

  findHighestVariantCombinationSortOrderByMenuItemId(
    menuItemId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<{ sortOrder: number } | null> {
    return client.itemVariantCombination.findFirst({
      where: { menuItemId },
      select: {
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async replaceVariantCombinationOptions(
    combinationId: string,
    optionIds: string[],
    client: MenuDatabaseClient = this.prisma,
  ): Promise<void> {
    await client.itemVariantCombinationOption.deleteMany({
      where: { combinationId },
    });

    if (optionIds.length > 0) {
      await client.itemVariantCombinationOption.createMany({
        data: optionIds.map((itemOptionId) => ({
          combinationId,
          itemOptionId,
        })),
      });
    }
  }

  async decrementTrackedVariantCombinationStock(
    combinationId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    const result = await client.itemVariantCombination.updateMany({
      where: {
        id: combinationId,
        isStockTracked: true,
        stockQuantity: {
          not: null,
          gte: quantity,
        },
      },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });

    return result.count > 0;
  }

  incrementVariantCombinationStock(
    combinationId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.$executeRaw`
      UPDATE "ItemVariantCombination"
      SET "stockQuantity" = COALESCE("stockQuantity", 0) + ${quantity}
      WHERE "id" = ${combinationId}
    `;
  }

  findItemInventoryLotById(
    id: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemInventoryLotRecord | null> {
    return client.menuItemInventoryLot.findUnique({
      where: { id },
      include: menuItemInventoryLotInclude,
    });
  }

  findItemInventoryLotByMenuItemIdAndBatchNo(
    menuItemId: string,
    batchNo: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemInventoryLotRecord | null> {
    return client.menuItemInventoryLot.findUnique({
      where: {
        menuItemId_batchNo: {
          menuItemId,
          batchNo,
        },
      },
      include: menuItemInventoryLotInclude,
    });
  }

  listItemInventoryLotsByMenuItemId(
    menuItemId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemInventoryLotRecord[]> {
    return client.menuItemInventoryLot.findMany({
      where: { menuItemId },
      include: menuItemInventoryLotInclude,
      orderBy: [{ expiryDate: 'asc' }, { receivedAt: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createItemInventoryLot(
    data: Prisma.MenuItemInventoryLotUncheckedCreateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemInventoryLotRecord> {
    return client.menuItemInventoryLot.create({
      data,
      include: menuItemInventoryLotInclude,
    });
  }

  updateItemInventoryLot(
    id: string,
    data: Prisma.MenuItemInventoryLotUpdateInput,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<MenuItemInventoryLotRecord> {
    return client.menuItemInventoryLot.update({
      where: { id },
      data,
      include: menuItemInventoryLotInclude,
    });
  }

  countItemInventoryLotsByMenuItemId(
    menuItemId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.menuItemInventoryLot.count({
      where: { menuItemId },
    });
  }

  countRemainingItemInventoryLotsByMenuItemId(
    menuItemId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.menuItemInventoryLot.count({
      where: {
        menuItemId,
        remainingQuantity: {
          gt: 0,
        },
      },
    });
  }

  async adjustItemInventoryLotQuantity(
    lotId: string,
    delta: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    if (delta === 0) {
      return true;
    }

    const result = await client.menuItemInventoryLot.updateMany({
      where: {
        id: lotId,
        ...(delta < 0
          ? {
              remainingQuantity: {
                gte: Math.abs(delta),
              },
            }
          : {}),
      },
      data: {
        remainingQuantity:
          delta < 0
            ? {
                decrement: Math.abs(delta),
              }
            : {
                increment: delta,
              },
        ...(delta > 0
          ? {
              receivedQuantity: {
                increment: delta,
              },
            }
          : {}),
      },
    });

    return result.count > 0;
  }

  async decrementItemInventoryLotQuantity(
    lotId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<boolean> {
    const result = await client.menuItemInventoryLot.updateMany({
      where: {
        id: lotId,
        remainingQuantity: {
          gte: quantity,
        },
      },
      data: {
        remainingQuantity: {
          decrement: quantity,
        },
      },
    });

    return result.count > 0;
  }

  incrementItemInventoryLotRemainingQuantity(
    lotId: string,
    quantity: number,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<number> {
    return client.$executeRaw`
      UPDATE "MenuItemInventoryLot"
      SET "remainingQuantity" = "remainingQuantity" + ${quantity}
      WHERE "id" = ${lotId}
    `;
  }

  findBranchCatalogByBranchId(
    branchId: string,
  ): Promise<BranchCatalogRecord | null> {
    return this.prisma.branch.findUnique({
      where: { id: branchId },
      include: branchCatalogInclude,
    });
  }

  listApprovedStoreTypesByBranchId(
    branchId: string,
    client: MenuDatabaseClient = this.prisma,
  ): Promise<ApprovedBranchStoreTypeRecord[]> {
    return client.branchStoreType.findMany({
      where: {
        branchId,
        status: BranchStoreTypeStatus.APPROVED,
        storeType: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: approvedBranchStoreTypeInclude,
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async replaceCategoryStoreTypes(
    categoryId: string,
    storeTypeIds: string[],
    client: MenuDatabaseClient = this.prisma,
  ): Promise<void> {
    await client.menuCategoryStoreType.deleteMany({
      where: { categoryId },
    });

    if (storeTypeIds.length > 0) {
      await client.menuCategoryStoreType.createMany({
        data: storeTypeIds.map((storeTypeId) => ({
          categoryId,
          storeTypeId,
        })),
      });
    }
  }

  async replaceItemStoreTypes(
    itemId: string,
    storeTypeIds: string[],
    client: MenuDatabaseClient = this.prisma,
  ): Promise<void> {
    await client.menuItemStoreType.deleteMany({
      where: { itemId },
    });

    if (storeTypeIds.length > 0) {
      await client.menuItemStoreType.createMany({
        data: storeTypeIds.map((storeTypeId) => ({
          itemId,
          storeTypeId,
        })),
      });
    }
  }
}
