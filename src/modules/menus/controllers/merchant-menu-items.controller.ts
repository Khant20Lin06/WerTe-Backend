import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemDto } from '../dto/menu-item.dto';
import { MenuItemRuleProfileDto } from '../dto/menu-item-rule-profile.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MerchantMenuItemsService } from '../services/merchant-menu-items.service';

@ApiTags('merchant-menu-items')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/menu/items')
export class MerchantMenuItemsController {
  constructor(
    private readonly merchantMenuItemsService: MerchantMenuItemsService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantMenuItems',
    summary: 'List menu items for a merchant-owned branch',
  })
  @ApiOkResponse({
    description: 'Returns menu items owned by the requested merchant branch.',
    type: MenuItemDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantMenuItemsService.listBranchItems(currentUser, branchId);
  }

  @ApiOperation({
    operationId: 'listMerchantMenuItemRuleProfiles',
    summary: 'List effective vertical catalog rule profiles for a merchant-owned branch',
  })
  @ApiOkResponse({
    description:
      'Returns the branch-effective store type catalog requirements that merchant menu items should satisfy.',
    type: MenuItemRuleProfileDto,
    isArray: true,
  })
  @Get('rule-profiles')
  listRuleProfiles(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantMenuItemsService.listBranchItemRuleProfiles(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantMenuItem',
    summary: 'Return one menu item for a merchant-owned branch',
  })
  @ApiOkResponse({
    description: 'Returns one menu item scoped to the requested branch.',
    type: MenuItemDto,
  })
  @Get(':itemId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.merchantMenuItemsService.getBranchItem(
      currentUser,
      branchId,
      itemId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantMenuItem',
    summary: 'Create a menu item for a merchant-owned branch',
  })
  @ApiBody({ type: CreateMenuItemDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a menu item for the requested branch.',
    type: MenuItemDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: CreateMenuItemDto,
  ) {
    return this.merchantMenuItemsService.createBranchItem(
      currentUser,
      branchId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantMenuItem',
    summary: 'Update a menu item for a merchant-owned branch',
  })
  @ApiBody({ type: UpdateMenuItemDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested menu item.',
    type: MenuItemDto,
  })
  @Patch(':itemId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateMenuItemDto,
  ) {
    return this.merchantMenuItemsService.updateBranchItem(
      currentUser,
      branchId,
      itemId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'deleteMerchantMenuItem',
    summary: 'Delete a menu item from a merchant-owned branch',
  })
  @ApiNoContentResponse({ description: 'Menu item deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':itemId')
  delete(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.merchantMenuItemsService.deleteBranchItem(
      currentUser,
      branchId,
      itemId,
    );
  }

  @ApiOperation({
    operationId: 'adjustMerchantMenuItemInventory',
    summary: 'Adjust tracked inventory for a merchant-owned menu item',
  })
  @ApiBody({ type: AdjustInventoryDto })
  @ApiOkResponse({
    description: 'Applies a stock delta and returns the updated item.',
    type: MenuItemDto,
  })
  @Post(':itemId/inventory-adjustments')
  adjustInventory(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: AdjustInventoryDto,
  ) {
    return this.merchantMenuItemsService.adjustBranchItemInventory(
      currentUser,
      branchId,
      itemId,
      body,
    );
  }
}
