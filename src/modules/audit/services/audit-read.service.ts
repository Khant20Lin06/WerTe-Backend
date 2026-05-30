import { AuditResourceType, UserRole } from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';

@Injectable()
export class AuditReadService {
  constructor(private readonly auditService: AuditService) {}

  listAdminAuditLogs(
    currentUser: AuthenticatedUserEntity,
    query: ListAuditLogsQueryDto,
  ): Promise<AuditLogEntity[]> {
    this.assertCanReadAuditLogs(currentUser);

    return this.auditService.listRecent(query.limit ?? 50);
  }

  listAdminOrderAuditLogs(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    query: ListAuditLogsQueryDto,
  ): Promise<AuditLogEntity[]> {
    this.assertCanReadAuditLogs(currentUser);

    return this.auditService.listByOrderId(orderId, query.limit ?? 50);
  }

  listAdminResourceAuditLogs(
    currentUser: AuthenticatedUserEntity,
    resourceType: AuditResourceType,
    resourceId: string,
    query: ListAuditLogsQueryDto,
  ): Promise<AuditLogEntity[]> {
    this.assertCanReadAuditLogs(currentUser);

    return this.auditService.listByResource(
      resourceType,
      resourceId,
      query.limit ?? 50,
    );
  }

  listAdminBranchMenuScopeAuditLogs(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    query: ListAuditLogsQueryDto,
  ): Promise<AuditLogEntity[]> {
    this.assertCanReadAuditLogs(currentUser);

    return this.auditService.listBranchMenuScopeLogs(branchId, query.limit ?? 50);
  }

  private assertCanReadAuditLogs(currentUser: AuthenticatedUserEntity): void {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new AppException(
        'You are not allowed to read audit logs.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }
}
