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
import { CreateItemOptionGroupDto } from '../dto/create-item-option-group.dto';
import { ItemOptionGroupDto } from '../dto/item-option-group.dto';
import { UpdateItemOptionGroupDto } from '../dto/update-item-option-group.dto';
import { MerchantMenuOptionGroupsService } from '../services/merchant-menu-option-groups.service';

@ApiTags('merchant-menu-item-option-groups')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/menu/items/:itemId/option-groups')
export class MerchantMenuOptionGroupsController {
  constructor(
    private readonly merchantMenuOptionGroupsService: MerchantMenuOptionGroupsService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantMenuItemOptionGroups',
    summary: 'List option groups for a merchant-owned menu item',
  })
  @ApiOkResponse({
    description: 'Returns option groups owned by the requested menu item.',
    type: ItemOptionGroupDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.merchantMenuOptionGroupsService.listItemOptionGroups(
      currentUser,
      branchId,
      itemId,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantMenuItemOptionGroup',
    summary: 'Return one option group for a merchant-owned menu item',
  })
  @ApiOkResponse({
    description: 'Returns one option group scoped to the requested menu item.',
    type: ItemOptionGroupDto,
  })
  @Get(':optionGroupId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
  ) {
    return this.merchantMenuOptionGroupsService.getItemOptionGroup(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantMenuItemOptionGroup',
    summary: 'Create an option group for a merchant-owned menu item',
  })
  @ApiBody({ type: CreateItemOptionGroupDto })
  @ApiCreatedResponse({
    description: 'Creates and returns an option group for the requested menu item.',
    type: ItemOptionGroupDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: CreateItemOptionGroupDto,
  ) {
    return this.merchantMenuOptionGroupsService.createItemOptionGroup(
      currentUser,
      branchId,
      itemId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantMenuItemOptionGroup',
    summary: 'Update an option group for a merchant-owned menu item',
  })
  @ApiBody({ type: UpdateItemOptionGroupDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested option group.',
    type: ItemOptionGroupDto,
  })
  @Patch(':optionGroupId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('optionGroupId') optionGroupId: string,
    @Body() body: UpdateItemOptionGroupDto,
  ) {
    return this.merchantMenuOptionGroupsService.updateItemOptionGroup(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      body,
    );
  }
}
