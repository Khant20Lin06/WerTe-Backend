import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListMerchantInventoryAdjustmentsQueryDto } from '../dto/list-merchant-inventory-adjustments-query.dto';
import {
  MerchantInventoryAdjustmentDto,
} from '../dto/merchant-inventory-adjustment.dto';
import { MerchantInventoryOverviewDto } from '../dto/merchant-inventory-overview.dto';
import { MerchantRestockSuggestionsDto } from '../dto/merchant-restock-suggestions.dto';
import { MerchantInventoryReadService } from '../services/merchant-inventory-read.service';

@ApiTags('merchant-inventory')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/inventory')
export class MerchantInventoryController {
  constructor(
    private readonly merchantInventoryReadService: MerchantInventoryReadService,
  ) {}

  @ApiOperation({
    operationId: 'getMerchantBranchInventoryOverview',
    summary: 'Return tracked inventory totals and low-stock attention rows for a merchant-owned branch',
  })
  @ApiOkResponse({
    description:
      'Returns tracked inventory totals plus item and option rows that need merchant attention.',
    type: MerchantInventoryOverviewDto,
  })
  @Get('overview')
  getOverview(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantInventoryReadService.getOwnedBranchInventoryOverview(
      currentUser.userId,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'listMerchantBranchInventoryAdjustments',
    summary: 'List recent inventory adjustment events for a merchant-owned branch',
  })
  @ApiOkResponse({
    description:
      'Returns recent item and option inventory adjustment audit events for the requested branch.',
    type: MerchantInventoryAdjustmentDto,
    isArray: true,
  })
  @Get('adjustments')
  listAdjustments(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Query() query: ListMerchantInventoryAdjustmentsQueryDto,
  ) {
    return this.merchantInventoryReadService.listOwnedBranchInventoryAdjustments(
      currentUser.userId,
      branchId,
      query.limit ?? 25,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantBranchRestockSuggestions',
    summary:
      'Return current restock suggestions for tracked low-stock and out-of-stock branch inventory',
  })
  @ApiOkResponse({
    description:
      'Returns suggested restock targets for tracked items and options that currently require merchant attention.',
    type: MerchantRestockSuggestionsDto,
  })
  @Get('restock-suggestions')
  getRestockSuggestions(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantInventoryReadService.getOwnedBranchRestockSuggestions(
      currentUser.userId,
      branchId,
    );
  }
}
