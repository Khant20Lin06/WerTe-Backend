import { AdminRiderListQueryDto } from '../dto/admin-rider-list.dto';
import { AdminUpdateRiderStatusDto } from '../dto/admin-update-rider-status.dto';
import { RiderProfileDto } from '../dto/rider-profile.dto';
import { AdminRiderManagementService } from '../services/admin-rider-management.service';
export declare class AdminRidersController {
    private readonly adminRiderManagementService;
    constructor(adminRiderManagementService: AdminRiderManagementService);
    listRiders(query: AdminRiderListQueryDto): Promise<RiderProfileDto[]>;
    updateRiderStatus(riderId: string, body: AdminUpdateRiderStatusDto): Promise<RiderProfileDto>;
}
