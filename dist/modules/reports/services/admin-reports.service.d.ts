import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminInventoryAlertOverviewReportDto } from '../dto/admin-inventory-alert-overview-report.dto';
import { AdminInventoryAlertTrendsReportDto } from '../dto/admin-inventory-alert-trends-report.dto';
import { ListAdminInventoryAlertReportQueryDto } from '../dto/list-admin-inventory-alert-report-query.dto';
export declare class AdminReportsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getInventoryAlertOverview(currentUser: AuthenticatedUserEntity, query: ListAdminInventoryAlertReportQueryDto): Promise<AdminInventoryAlertOverviewReportDto>;
    getInventoryAlertTrends(currentUser: AuthenticatedUserEntity, query: ListAdminInventoryAlertReportQueryDto): Promise<AdminInventoryAlertTrendsReportDto>;
    private loadInventoryAlertAnalyticsWindow;
    private toResolvedInventoryAlert;
    private buildLatestLifecycleLogMap;
    private buildFollowUpLogMap;
    private resolveInventoryAlertStatus;
    private buildWindowStart;
    private normalizePeriodDays;
    private toUtcDateKey;
    private assertAdmin;
}
