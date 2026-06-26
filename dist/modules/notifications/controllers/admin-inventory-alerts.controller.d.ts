import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminInventoryAlertDto } from '../dto/admin-inventory-alert.dto';
import { AcknowledgeInventoryAlertDto } from '../dto/acknowledge-inventory-alert.dto';
import { BulkAcknowledgeInventoryAlertsDto } from '../dto/bulk-acknowledge-inventory-alerts.dto';
import { BulkAcknowledgeInventoryAlertsResponseDto } from '../dto/bulk-acknowledge-inventory-alerts-response.dto';
import { BulkDismissInventoryAlertsDto } from '../dto/bulk-dismiss-inventory-alerts.dto';
import { BulkDismissInventoryAlertsResponseDto } from '../dto/bulk-dismiss-inventory-alerts-response.dto';
import { ListAdminInventoryAlertsQueryDto } from '../dto/list-admin-inventory-alerts-query.dto';
import { AdminInventoryAlertsService } from '../services/admin-inventory-alerts.service';
export declare class AdminInventoryAlertsController {
    private readonly adminInventoryAlertsService;
    constructor(adminInventoryAlertsService: AdminInventoryAlertsService);
    list(currentUser: AuthenticatedUserEntity, query: ListAdminInventoryAlertsQueryDto): Promise<AdminInventoryAlertDto[]>;
    bulkAcknowledge(currentUser: AuthenticatedUserEntity, payload: BulkAcknowledgeInventoryAlertsDto): Promise<BulkAcknowledgeInventoryAlertsResponseDto>;
    bulkDismiss(currentUser: AuthenticatedUserEntity, payload: BulkDismissInventoryAlertsDto): Promise<BulkDismissInventoryAlertsResponseDto>;
    acknowledge(currentUser: AuthenticatedUserEntity, notificationId: string, payload: AcknowledgeInventoryAlertDto): Promise<AdminInventoryAlertDto>;
    resolve(currentUser: AuthenticatedUserEntity, notificationId: string, payload: AcknowledgeInventoryAlertDto): Promise<AdminInventoryAlertDto>;
}
