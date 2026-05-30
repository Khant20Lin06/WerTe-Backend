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
import { CreateItemInventoryLotDto } from '../dto/create-item-inventory-lot.dto';
import { ItemInventoryLotDto } from '../dto/item-inventory-lot.dto';
import { UpdateItemInventoryLotDto } from '../dto/update-item-inventory-lot.dto';
import { MerchantMenuItemInventoryLotsService } from '../services/merchant-menu-item-inventory-lots.service';

@ApiTags('merchant-menu-item-inventory-lots')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/menu/items/:itemId/inventory-lots')
export class MerchantMenuItemInventoryLotsController {
  constructor(
    private readonly merchantMenuItemInventoryLotsService: MerchantMenuItemInventoryLotsService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantMenuItemInventoryLots',
    summary: 'List inventory lots for a merchant-owned tracked menu item',
  })
  @ApiOkResponse({
    description: 'Returns inventory lots for the requested menu item.',
    type: ItemInventoryLotDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.merchantMenuItemInventoryLotsService.listItemInventoryLots(
      currentUser,
      branchId,
      itemId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantMenuItemInventoryLot',
    summary: 'Create a new inventory lot for a merchant-owned tracked menu item',
  })
  @ApiBody({ type: CreateItemInventoryLotDto })
  @ApiCreatedResponse({
    description: 'Creates and returns the inventory lot.',
    type: ItemInventoryLotDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: CreateItemInventoryLotDto,
  ) {
    return this.merchantMenuItemInventoryLotsService.createItemInventoryLot(
      currentUser,
      branchId,
      itemId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantMenuItemInventoryLot',
    summary: 'Update lot metadata for a merchant-owned tracked menu item',
  })
  @ApiBody({ type: UpdateItemInventoryLotDto })
  @ApiOkResponse({
    description: 'Updates and returns the inventory lot.',
    type: ItemInventoryLotDto,
  })
  @Patch(':lotId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('lotId') lotId: string,
    @Body() body: UpdateItemInventoryLotDto,
  ) {
    return this.merchantMenuItemInventoryLotsService.updateItemInventoryLot(
      currentUser,
      branchId,
      itemId,
      lotId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'adjustMerchantMenuItemInventoryLot',
    summary: 'Adjust remaining quantity for a merchant-owned inventory lot',
  })
  @ApiBody({ type: AdjustInventoryDto })
  @ApiOkResponse({
    description: 'Applies a quantity delta to the inventory lot and returns the updated lot.',
    type: ItemInventoryLotDto,
  })
  @Post(':lotId/inventory-adjustments')
  adjust(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('lotId') lotId: string,
    @Body() body: AdjustInventoryDto,
  ) {
    return this.merchantMenuItemInventoryLotsService.adjustItemInventoryLot(
      currentUser,
      branchId,
      itemId,
      lotId,
      body,
    );
  }
}
