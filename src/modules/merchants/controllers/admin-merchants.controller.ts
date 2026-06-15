import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminMerchantListQueryDto } from '../dto/admin-merchant-list.dto';
import { AdminUpdateMerchantStatusDto } from '../dto/admin-update-merchant-status.dto';
import { MerchantProfileDto } from '../dto/merchant-profile.dto';
import { AdminMerchantManagementService } from '../services/admin-merchant-management.service';

@ApiTags('admin-merchants')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/merchants')
export class AdminMerchantsController {
  constructor(
    private readonly adminMerchantManagementService: AdminMerchantManagementService,
  ) {}

  @ApiOperation({
    operationId: 'adminListMerchants',
    summary: 'List all merchants with optional status filter',
  })
  @ApiOkResponse({
    description: 'Returns list of merchant profiles.',
    type: [MerchantProfileDto],
  })
  @Get()
  listMerchants(@Query() query: AdminMerchantListQueryDto) {
    return this.adminMerchantManagementService.listMerchants(query.status);
  }

  @ApiOperation({
    operationId: 'adminUpdateMerchantStatus',
    summary: 'Approve (ACTIVE) or suspend (SUSPENDED) a merchant',
  })
  @ApiParam({ name: 'merchantId', description: 'Merchant identifier' })
  @ApiBody({ type: AdminUpdateMerchantStatusDto })
  @ApiOkResponse({
    description: 'Returns the updated merchant profile.',
    type: MerchantProfileDto,
  })
  @Patch(':merchantId/status')
  updateMerchantStatus(
    @Param('merchantId') merchantId: string,
    @Body() body: AdminUpdateMerchantStatusDto,
  ) {
    return this.adminMerchantManagementService.updateMerchantStatus(
      merchantId,
      body.status,
    );
  }
}
