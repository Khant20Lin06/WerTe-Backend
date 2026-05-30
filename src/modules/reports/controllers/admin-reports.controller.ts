import { Controller, Get, Query } from '@nestjs/common';
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
import { AdminInventoryAlertOverviewReportDto } from '../dto/admin-inventory-alert-overview-report.dto';
import { AdminInventoryAlertTrendsReportDto } from '../dto/admin-inventory-alert-trends-report.dto';
import { ListAdminInventoryAlertReportQueryDto } from '../dto/list-admin-inventory-alert-report-query.dto';
import { AdminReportsService } from '../services/admin-reports.service';

@ApiTags('admin-reports')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @ApiOperation({
    operationId: 'getAdminInventoryAlertOverviewReport',
    summary: 'Get admin inventory alert overview analytics',
  })
  @ApiOkResponse({
    description:
      'Returns aggregated inventory alert, follow-up, and push delivery observability counts for the requested analytics window.',
    type: AdminInventoryAlertOverviewReportDto,
  })
  @Get('inventory-alerts/overview')
  overview(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListAdminInventoryAlertReportQueryDto,
  ) {
    return this.adminReportsService.getInventoryAlertOverview(currentUser, query);
  }

  @ApiOperation({
    operationId: 'getAdminInventoryAlertTrendsReport',
    summary: 'Get admin inventory alert trend analytics',
  })
  @ApiOkResponse({
    description:
      'Returns day-by-day inventory alert creation and lifecycle event counts for the requested analytics window.',
    type: AdminInventoryAlertTrendsReportDto,
  })
  @Get('inventory-alerts/trends')
  trends(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListAdminInventoryAlertReportQueryDto,
  ) {
    return this.adminReportsService.getInventoryAlertTrends(currentUser, query);
  }
}
