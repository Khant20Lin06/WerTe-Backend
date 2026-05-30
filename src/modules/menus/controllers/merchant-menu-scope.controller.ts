import { Controller, Get, Param } from '@nestjs/common';
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
import { MerchantMenuScopeOverviewDto } from '../dto/merchant-menu-scope-overview.dto';
import { MerchantCatalogReadService } from '../services/merchant-catalog-read.service';

@ApiTags('merchant-menu-scope')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/menu')
export class MerchantMenuScopeController {
  constructor(
    private readonly merchantCatalogReadService: MerchantCatalogReadService,
  ) {}

  @ApiOperation({
    operationId: 'getMerchantMenuScopeOverview',
    summary: 'Return scope management overview for a merchant-owned branch catalog',
  })
  @ApiOkResponse({
    description:
      'Returns approved store types plus category/item scope summaries for merchant management UX.',
    type: MerchantMenuScopeOverviewDto,
  })
  @Get('scope-overview')
  getScopeOverview(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantCatalogReadService.getOwnedBranchScopeOverview(
      currentUser.userId,
      branchId,
    );
  }
}
