import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerStoreCatalogEntryDto } from '../dto/customer-store-catalog-entry.dto';
import { CustomerStoreDetailDto } from '../dto/customer-store-detail.dto';
import { CustomerStoreFacetsDto } from '../dto/customer-store-facets.dto';
import { GetCustomerStoreCatalogQueryDto } from '../dto/get-customer-store-catalog-query.dto';
import { CustomerStoreSummaryDto } from '../dto/customer-store-summary.dto';
import { ListCustomerStoresQueryDto } from '../dto/list-customer-stores-query.dto';
import { CustomerStoreDiscoveryService } from '../services/customer-store-discovery.service';

@ApiTags('customer-stores')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/stores')
export class CustomerStoresController {
  constructor(
    private readonly customerStoreDiscoveryService: CustomerStoreDiscoveryService,
  ) {}

  @Public()
  @ApiOperation({
    operationId: 'getCustomerStoreFacets',
    summary: 'Return customer-visible store discovery facets for the active filters',
  })
  @ApiOkResponse({
    description:
      'Returns store type and township facet counts derived from customer-visible stores matching the current filters.',
    type: CustomerStoreFacetsDto,
  })
  @Get('facets')
  facets(
    @CurrentUser() currentUser: AuthenticatedUserEntity | null,
    @Query() query: ListCustomerStoresQueryDto,
  ) {
    return this.customerStoreDiscoveryService.getDiscoverableStoreFacets(
      currentUser,
      query,
    );
  }

  @Public()
  @ApiOperation({
    operationId: 'listCustomerStores',
    summary: 'List customer-visible stores with multi-type discovery filters',
  })
  @ApiOkResponse({
    description:
      'Returns active merchant branches with approved active store types visible to the authenticated customer.',
    type: CustomerStoreSummaryDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity | null,
    @Query() query: ListCustomerStoresQueryDto,
  ) {
    return this.customerStoreDiscoveryService.listDiscoverableStores(
      currentUser,
      query,
    );
  }

  @ApiOperation({
    operationId: 'getCustomerStoreDetail',
    summary:
      'Return customer-visible store detail metadata, catalog-entry options, and visible catalog counts',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Customer-visible store branch identifier.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description:
      'Returns customer-visible store detail metadata for an active branch with at least one approved active store type.',
    type: CustomerStoreDetailDto,
  })
  @Get(':branchId')
  detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.customerStoreDiscoveryService.getDiscoverableStoreDetail(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'getCustomerStoreCatalogEntry',
    summary:
      'Return the customer-visible catalog entry for a branch scoped to a selected approved store type',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Customer-visible store branch identifier.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description:
      'Returns store detail metadata plus the visible catalog for the selected approved store-type entry.',
    type: CustomerStoreCatalogEntryDto,
  })
  @Get(':branchId/catalog')
  catalog(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Query() query: GetCustomerStoreCatalogQueryDto,
  ) {
    return this.customerStoreDiscoveryService.getDiscoverableStoreCatalogEntry(
      currentUser,
      branchId,
      query,
    );
  }
}
