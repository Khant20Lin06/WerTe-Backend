import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminInventoryAlertDto } from '../dto/admin-inventory-alert.dto';
import { AcknowledgeInventoryAlertDto } from '../dto/acknowledge-inventory-alert.dto';
import { BulkAcknowledgeInventoryAlertsDto } from '../dto/bulk-acknowledge-inventory-alerts.dto';
import { BulkAcknowledgeInventoryAlertsResponseDto } from '../dto/bulk-acknowledge-inventory-alerts-response.dto';
import { BulkDismissInventoryAlertsDto } from '../dto/bulk-dismiss-inventory-alerts.dto';
import { BulkDismissInventoryAlertsResponseDto } from '../dto/bulk-dismiss-inventory-alerts-response.dto';
import { ListAdminInventoryAlertsQueryDto } from '../dto/list-admin-inventory-alerts-query.dto';
import { AdminInventoryAlertsService } from '../services/admin-inventory-alerts.service';

@ApiTags('admin-inventory-alerts')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/inventory-alerts')
export class AdminInventoryAlertsController {
  constructor(
    private readonly adminInventoryAlertsService: AdminInventoryAlertsService,
  ) {}

  @ApiOperation({
    operationId: 'listAdminInventoryAlerts',
    summary: 'List admin-visible merchant inventory alerts',
  })
  @ApiOkResponse({
    description:
      'Returns merchant inventory system alerts with acknowledgement state for the admin control plane.',
    type: AdminInventoryAlertDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListAdminInventoryAlertsQueryDto,
  ) {
    return this.adminInventoryAlertsService.listInventoryAlerts(currentUser, query);
  }

  @ApiOperation({
    operationId: 'bulkAcknowledgeAdminInventoryAlerts',
    summary: 'Bulk acknowledge merchant inventory alerts',
  })
  @ApiOkResponse({
    description:
      'Returns the resolved inventory alerts and the number of alerts acknowledged by the bulk request.',
    type: BulkAcknowledgeInventoryAlertsResponseDto,
  })
  @Post('bulk-acknowledge')
  bulkAcknowledge(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() payload: BulkAcknowledgeInventoryAlertsDto,
  ) {
    return this.adminInventoryAlertsService.bulkAcknowledgeInventoryAlerts(
      currentUser,
      payload,
    );
  }

  @ApiOperation({
    operationId: 'bulkDismissAdminInventoryAlerts',
    summary: 'Bulk dismiss merchant inventory alerts',
  })
  @ApiOkResponse({
    description:
      'Returns the resolved inventory alerts and the number of alerts dismissed by the bulk request.',
    type: BulkDismissInventoryAlertsResponseDto,
  })
  @Post('bulk-dismiss')
  bulkDismiss(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() payload: BulkDismissInventoryAlertsDto,
  ) {
    return this.adminInventoryAlertsService.bulkDismissInventoryAlerts(
      currentUser,
      payload,
    );
  }

  @ApiOperation({
    operationId: 'acknowledgeAdminInventoryAlert',
    summary: 'Acknowledge a merchant inventory alert',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Inventory alert notification identifier.',
    example: 'notification_1',
  })
  @ApiOkResponse({
    description:
      'Returns the inventory alert with its latest acknowledgement snapshot.',
    type: AdminInventoryAlertDto,
  })
  @Post(':notificationId/acknowledge')
  acknowledge(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('notificationId') notificationId: string,
    @Body() payload: AcknowledgeInventoryAlertDto,
  ) {
    return this.adminInventoryAlertsService.acknowledgeInventoryAlert(
      currentUser,
      notificationId,
      payload,
    );
  }

  @ApiOperation({
    operationId: 'resolveAdminInventoryAlert',
    summary: 'Resolve a merchant inventory alert',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Inventory alert notification identifier.',
    example: 'notification_1',
  })
  @ApiOkResponse({
    description:
      'Returns the inventory alert with its latest lifecycle snapshot.',
    type: AdminInventoryAlertDto,
  })
  @Post(':notificationId/resolve')
  resolve(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('notificationId') notificationId: string,
    @Body() payload: AcknowledgeInventoryAlertDto,
  ) {
    return this.adminInventoryAlertsService.resolveInventoryAlert(
      currentUser,
      notificationId,
      payload,
    );
  }
}
