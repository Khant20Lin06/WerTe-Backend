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
import { CreateItemVariantCombinationDto } from '../dto/create-item-variant-combination.dto';
import { ItemVariantCombinationDto } from '../dto/item-variant-combination.dto';
import { UpdateItemVariantCombinationDto } from '../dto/update-item-variant-combination.dto';
import { MerchantMenuVariantCombinationsService } from '../services/merchant-menu-variant-combinations.service';

@ApiTags('merchant-menu-item-variant-combinations')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/menu/items/:itemId/variant-combinations')
export class MerchantMenuVariantCombinationsController {
  constructor(
    private readonly merchantMenuVariantCombinationsService: MerchantMenuVariantCombinationsService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantMenuItemVariantCombinations',
    summary: 'List variant combinations for a merchant-owned menu item',
  })
  @ApiOkResponse({
    description: 'Returns variant combinations owned by the requested menu item.',
    type: ItemVariantCombinationDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.merchantMenuVariantCombinationsService.listItemVariantCombinations(
      currentUser,
      branchId,
      itemId,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantMenuItemVariantCombination',
    summary: 'Return one variant combination for a merchant-owned menu item',
  })
  @ApiOkResponse({
    description: 'Returns one variant combination scoped to the requested menu item.',
    type: ItemVariantCombinationDto,
  })
  @Get(':combinationId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('combinationId') combinationId: string,
  ) {
    return this.merchantMenuVariantCombinationsService.getItemVariantCombination(
      currentUser,
      branchId,
      itemId,
      combinationId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantMenuItemVariantCombination',
    summary: 'Create a variant combination for a merchant-owned menu item',
  })
  @ApiBody({ type: CreateItemVariantCombinationDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a variant combination for the requested menu item.',
    type: ItemVariantCombinationDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: CreateItemVariantCombinationDto,
  ) {
    return this.merchantMenuVariantCombinationsService.createItemVariantCombination(
      currentUser,
      branchId,
      itemId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantMenuItemVariantCombination',
    summary: 'Update a variant combination for a merchant-owned menu item',
  })
  @ApiBody({ type: UpdateItemVariantCombinationDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested variant combination.',
    type: ItemVariantCombinationDto,
  })
  @Patch(':combinationId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Param('combinationId') combinationId: string,
    @Body() body: UpdateItemVariantCombinationDto,
  ) {
    return this.merchantMenuVariantCombinationsService.updateItemVariantCombination(
      currentUser,
      branchId,
      itemId,
      combinationId,
      body,
    );
  }
}
