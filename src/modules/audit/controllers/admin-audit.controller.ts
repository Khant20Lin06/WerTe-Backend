import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditResourceType, UserRole } from '@prisma/client';
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
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditReadService } from '../services/audit-read.service';

@ApiTags('admin-audit')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/audit')
export class AdminAuditController {
  constructor(private readonly auditReadService: AuditReadService) {}

  @ApiOperation({
    operationId: 'listAdminAuditLogs',
    summary: 'List recent audit log records for the admin control plane',
  })
  @ApiOkResponse({
    description: 'Returns recent audit logs visible to administrators.',
    type: AuditLogEntity,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditReadService.listAdminAuditLogs(currentUser, query);
  }

  @ApiOperation({
    operationId: 'listAdminOrderAuditLogs',
    summary: 'List audit logs for a specific order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns audit logs related to the requested order.',
    type: AuditLogEntity,
    isArray: true,
  })
  @Get('orders/:orderId')
  listOrderLogs(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditReadService.listAdminOrderAuditLogs(
      currentUser,
      orderId,
      query,
    );
  }

  @ApiOperation({
    operationId: 'listAdminResourceAuditLogs',
    summary: 'List audit logs for a specific resource',
  })
  @ApiParam({
    name: 'resourceType',
    description: 'Resource type recorded in the audit log.',
    enum: AuditResourceType,
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource identifier recorded in the audit log.',
    example: 'message_1',
  })
  @ApiOkResponse({
    description: 'Returns audit logs related to the requested resource.',
    type: AuditLogEntity,
    isArray: true,
  })
  @Get('resources/:resourceType/:resourceId')
  listResourceLogs(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('resourceType') resourceType: AuditResourceType,
    @Param('resourceId') resourceId: string,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditReadService.listAdminResourceAuditLogs(
      currentUser,
      resourceType,
      resourceId,
      query,
    );
  }

  @ApiOperation({
    operationId: 'listAdminBranchMenuScopeAuditLogs',
    summary: 'List menu scope audit logs for a specific branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description:
      'Returns menu category and menu item scope audit logs for the requested branch.',
    type: AuditLogEntity,
    isArray: true,
  })
  @Get('branches/:branchId/menu-scopes')
  listBranchMenuScopeLogs(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Query() query: ListAuditLogsQueryDto,
  ) {
    return this.auditReadService.listAdminBranchMenuScopeAuditLogs(
      currentUser,
      branchId,
      query,
    );
  }
}
