import { HttpStatus, Injectable } from '@nestjs/common';
import { ItemOptionGroupKind } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemOptionGroupDto } from '../dto/create-item-option-group.dto';
import {
  ItemOptionGroupDto,
  toItemOptionGroupDto,
} from '../dto/item-option-group.dto';
import { UpdateItemOptionGroupDto } from '../dto/update-item-option-group.dto';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenuOptionGroupPolicyService } from '../policies/menu-option-group-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantMenuOptionGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menusService: MenusService,
    private readonly menusRepository: MenusRepository,
    private readonly menuOptionGroupPolicyService: MenuOptionGroupPolicyService,
  ) {}

  async listItemOptionGroups(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<ItemOptionGroupDto[]> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const groups = await this.menusService.listOptionGroupsByMenuItemId(item.id);

    return groups.map((group) => toItemOptionGroupDto(group));
  }

  async getItemOptionGroup(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
  ): Promise<ItemOptionGroupDto> {
    const group = await this.resolveOwnedOptionGroup(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
    );

    return toItemOptionGroupDto(group);
  }

  async createItemOptionGroup(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    payload: CreateItemOptionGroupDto,
  ): Promise<ItemOptionGroupDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    this.assertSelectionBounds(
      payload.minSelect,
      payload.maxSelect,
      payload.kind ?? ItemOptionGroupKind.ADD_ON,
    );

    const optionGroup = await this.prisma.runInTransaction(async (tx) => {
      const nextSortOrder =
        payload.sortOrder ??
        ((await this.menusRepository.findHighestOptionGroupSortOrderByMenuItemId(
          item.id,
          tx,
        ))?.sortOrder ?? -1) + 1;

      return this.menusRepository.createOptionGroup(
        {
          menuItemId: item.id,
          name: payload.name,
          description: payload.description,
          kind: payload.kind ?? ItemOptionGroupKind.ADD_ON,
          minSelect: payload.minSelect,
          maxSelect: payload.maxSelect,
          sortOrder: nextSortOrder,
          isActive: payload.isActive ?? true,
        },
        tx,
      );
    });

    return toItemOptionGroupDto(optionGroup);
  }

  async updateItemOptionGroup(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    payload: UpdateItemOptionGroupDto,
  ): Promise<ItemOptionGroupDto> {
    const optionGroup = await this.resolveOwnedOptionGroup(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
    );
    const minSelect = payload.minSelect ?? optionGroup.minSelect;
    const maxSelect = payload.maxSelect ?? optionGroup.maxSelect;
    const kind = payload.kind ?? optionGroup.kind;

    this.assertSelectionBounds(minSelect, maxSelect, kind);

    const updatedGroup = await this.menusRepository.updateOptionGroup(
      optionGroup.id,
      {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.kind !== undefined ? { kind: payload.kind } : {}),
        ...(payload.minSelect !== undefined
          ? { minSelect: payload.minSelect }
          : {}),
        ...(payload.maxSelect !== undefined
          ? { maxSelect: payload.maxSelect }
          : {}),
        ...(payload.sortOrder !== undefined
          ? { sortOrder: payload.sortOrder }
          : {}),
        ...(payload.isActive !== undefined
          ? { isActive: payload.isActive }
          : {}),
      },
    );

    return toItemOptionGroupDto(updatedGroup);
  }

  private async resolveOwnedItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<MenuItemOwnershipRecord> {
    const item = await this.menusService.findItemOwnedByUserId(
      currentUser.userId,
      itemId,
    );

    if (item === null || item.branch.id !== branchId) {
      throw new AppException(
        'Menu item was not found for the requested branch.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (!this.menuOptionGroupPolicyService.canManageItem(currentUser, item)) {
      throw new AppException(
        'You are not allowed to manage option groups for this menu item.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return item;
  }

  private async resolveOwnedOptionGroup(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
  ): Promise<ItemOptionGroupOwnershipRecord> {
    const optionGroup = await this.menusService.findOptionGroupOwnedByUserId(
      currentUser.userId,
      optionGroupId,
    );

    if (
      optionGroup === null ||
      optionGroup.menuItem.branch.id !== branchId ||
      optionGroup.menuItem.id !== itemId
    ) {
      throw new AppException(
        'Item option group was not found for the requested menu item.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (
      !this.menuOptionGroupPolicyService.canManageOptionGroup(
        currentUser,
        optionGroup,
      )
    ) {
      throw new AppException(
        'You are not allowed to manage this option group.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return optionGroup;
  }

  private assertSelectionBounds(
    minSelect: number,
    maxSelect: number,
    kind: ItemOptionGroupKind,
  ): void {
    if (maxSelect < minSelect) {
      throw new AppException(
        'Option group maxSelect must be greater than or equal to minSelect.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            minSelect,
            maxSelect,
          },
        },
      );
    }

    if (kind === ItemOptionGroupKind.VARIANT_SELECTOR && maxSelect > 1) {
      throw new AppException(
        'Variant selector option groups can allow at most one selection.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            minSelect,
            maxSelect,
            kind,
          },
        },
      );
    }
  }
}
