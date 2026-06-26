import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminCustomerListQueryDto } from '../dto/admin-customer-list.dto';
import { CustomerProfileDto } from '../dto/customer-profile.dto';
import { AdminCustomerManagementService } from '../services/admin-customer-management.service';

class AdminUpdateCustomerStatusDto {
  status!: UserStatus;
}

@ApiTags('admin-customers')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(
    private readonly adminCustomerManagementService: AdminCustomerManagementService,
  ) {}

  @ApiOperation({
    operationId: 'adminListCustomers',
    summary: 'List all customers with optional status / search filter',
  })
  @ApiOkResponse({
    description: 'Returns list of customer profiles.',
    type: [CustomerProfileDto],
  })
  @Get()
  listCustomers(@Query() query: AdminCustomerListQueryDto) {
    return this.adminCustomerManagementService.listCustomers({
      status: query.status,
      search: query.search,
    });
  }

  @ApiOperation({
    operationId: 'adminUpdateCustomerStatus',
    summary: 'Suspend or reactivate a customer account',
  })
  @ApiParam({ name: 'customerId', description: 'Customer profile identifier' })
  @ApiBody({ type: AdminUpdateCustomerStatusDto })
  @ApiOkResponse({
    description: 'Returns the updated customer profile.',
    type: CustomerProfileDto,
  })
  @Patch(':customerId/status')
  updateCustomerStatus(
    @Param('customerId') customerId: string,
    @Body() body: AdminUpdateCustomerStatusDto,
  ) {
    return this.adminCustomerManagementService.updateCustomerStatus(
      customerId,
      body.status,
    );
  }
}
