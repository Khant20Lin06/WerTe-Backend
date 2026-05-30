import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ZoneDto } from '../dto/zone.dto';
import { ZoneManagementService } from '../services/zone-management.service';
export declare class MerchantZonesController {
    private readonly zoneManagementService;
    constructor(zoneManagementService: ZoneManagementService);
    listActive(currentUser: AuthenticatedUserEntity): Promise<ZoneDto[]>;
}
