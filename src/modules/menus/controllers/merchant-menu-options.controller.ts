import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateItemOptionDto } from '../dto/create-item-option.dto';
import { ItemOptionDto } from '../dto/item-option.dto';
import { UpdateItemOptionDto } from '../dto/update-item-option.dto';
import { MerchantMenuOptionsService } from '../services/merchant-menu-options.service';

@ApiTags('merchant-menu-item-options')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller(
  'merchant/branches/:branchId/menu/items/:itemId/option-groups/:optionGroupId/options',
)
export class MerchantMenuOptionsController {
  constructor(
    private readonly merchantMenuOptionsService: MerchantMenuOptionsService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantMenuItemOptions',
    summary: 'List options for a merchant-owned menu item option group',
  })
  @ApiOkResponse({
    description: 'Returns options owned by the requested option group.',
    type: ItemOptionDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
  ) {
    return this.merchantMenuOptionsService.listGroupOptions(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantMenuItemOption',
    summary: 'Return one option for a merchant-owned option group',
  })
  @ApiOkResponse({
    description: 'Returns one option scoped to the requested option group.',
    type: ItemOptionDto,
  })
  @Get(':optionId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Param('optionId') optionId: string,
  ) {
    return this.merchantMenuOptionsService.getGroupOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantMenuItemOption',
    summary: 'Create an option for a merchant-owned option group',
  })
  @ApiBody({ type: CreateItemOptionDto })
  @ApiCreatedResponse({
    description: 'Creates and returns an option for the requested option group.',
    type: ItemOptionDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Body() body: CreateItemOptionDto,
  ) {
    return this.merchantMenuOptionsService.createGroupOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantMenuItemOption',
    summary: 'Update an option for a merchant-owned option group',
  })
  @ApiBody({ type: UpdateItemOptionDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested option.',
    type: ItemOptionDto,
  })
  @Patch(':optionId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Param('optionId') optionId: string,
    @Body() body: UpdateItemOptionDto,
  ) {
    return this.merchantMenuOptionsService.updateGroupOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'adjustMerchantMenuItemOptionInventory',
    summary: 'Adjust tracked inventory for a merchant-owned item option',
  })
  @ApiBody({ type: AdjustInventoryDto })
  @ApiOkResponse({
    description: 'Applies a stock delta and returns the updated option.',
    type: ItemOptionDto,
  })
  @Post(':optionId/inventory-adjustments')
  adjustInventory(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Param('optionId') optionId: string,
    @Body() body: AdjustInventoryDto,
  ) {
    return this.merchantMenuOptionsService.adjustGroupOptionInventory(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
      body,
    );
  }
}
