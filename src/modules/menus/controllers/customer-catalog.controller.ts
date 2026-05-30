import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { BranchCatalogDto, toBranchCatalogDto } from '../dto/branch-catalog.dto';
import { GetCustomerBranchCatalogQueryDto } from '../dto/get-customer-branch-catalog-query.dto';
import { CustomerCatalogReadService } from '../services/customer-catalog-read.service';

@ApiTags('customer-menu-catalog')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/branches/:branchId/menu')
export class CustomerCatalogController {
  constructor(
    private readonly customerCatalogReadService: CustomerCatalogReadService,
  ) {}

  @ApiOperation({
    operationId: 'getCustomerBranchMenuCatalog',
    summary: 'Return the visible menu catalog for a customer-facing branch',
  })
  @ApiOkResponse({
    description:
      'Returns the active-only customer-visible menu catalog for the requested branch.',
    type: BranchCatalogDto,
  })
  @Get()
  async getBranchMenu(
    @Param('branchId') branchId: string,
    @Query() query: GetCustomerBranchCatalogQueryDto,
  ): Promise<BranchCatalogDto> {
    const branchCatalog =
      await this.customerCatalogReadService.getVisibleBranchCatalogOrThrow(
        branchId,
        {
          storeTypeCode: query.storeTypeCode,
        },
      );

    return toBranchCatalogDto(branchCatalog);
  }
}
