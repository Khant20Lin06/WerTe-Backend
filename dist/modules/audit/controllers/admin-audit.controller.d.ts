import { AuditResourceType } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditReadService } from '../services/audit-read.service';
export declare class AdminAuditController {
    private readonly auditReadService;
    constructor(auditReadService: AuditReadService);
    list(currentUser: AuthenticatedUserEntity, query: ListAuditLogsQueryDto): Promise<AuditLogEntity[]>;
    listOrderLogs(currentUser: AuthenticatedUserEntity, orderId: string, query: ListAuditLogsQueryDto): Promise<AuditLogEntity[]>;
    listResourceLogs(currentUser: AuthenticatedUserEntity, resourceType: AuditResourceType, resourceId: string, query: ListAuditLogsQueryDto): Promise<AuditLogEntity[]>;
}
