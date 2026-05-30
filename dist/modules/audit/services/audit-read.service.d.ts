import { AuditResourceType } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';
export declare class AuditReadService {
    private readonly auditService;
    constructor(auditService: AuditService);
    listAdminAuditLogs(currentUser: AuthenticatedUserEntity, query: ListAuditLogsQueryDto): Promise<AuditLogEntity[]>;
    listAdminOrderAuditLogs(currentUser: AuthenticatedUserEntity, orderId: string, query: ListAuditLogsQueryDto): Promise<AuditLogEntity[]>;
    listAdminResourceAuditLogs(currentUser: AuthenticatedUserEntity, resourceType: AuditResourceType, resourceId: string, query: ListAuditLogsQueryDto): Promise<AuditLogEntity[]>;
    private assertCanReadAuditLogs;
}
