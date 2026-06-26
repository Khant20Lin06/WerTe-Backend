import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminInventoryAlertOverviewReportDto } from '../dto/admin-inventory-alert-overview-report.dto';
import { AdminInventoryAlertTrendsReportDto } from '../dto/admin-inventory-alert-trends-report.dto';
import { ListAdminInventoryAlertReportQueryDto } from '../dto/list-admin-inventory-alert-report-query.dto';
import { AdminReportsService } from '../services/admin-reports.service';
export declare class AdminReportsController {
    private readonly adminReportsService;
    constructor(adminReportsService: AdminReportsService);
    overview(currentUser: AuthenticatedUserEntity, query: ListAdminInventoryAlertReportQueryDto): Promise<AdminInventoryAlertOverviewReportDto>;
    trends(currentUser: AuthenticatedUserEntity, query: ListAdminInventoryAlertReportQueryDto): Promise<AdminInventoryAlertTrendsReportDto>;
}
