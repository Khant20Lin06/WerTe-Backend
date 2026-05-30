import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateZoneDto } from '../dto/create-zone.dto';
import { UpdateZoneDto } from '../dto/update-zone.dto';
import { ZoneDto } from '../dto/zone.dto';
import { ZoneManagementService } from '../services/zone-management.service';
export declare class AdminZonesController {
    private readonly zoneManagementService;
    constructor(zoneManagementService: ZoneManagementService);
    list(currentUser: AuthenticatedUserEntity): Promise<ZoneDto[]>;
    get(currentUser: AuthenticatedUserEntity, zoneId: string): Promise<ZoneDto>;
    create(currentUser: AuthenticatedUserEntity, body: CreateZoneDto): Promise<ZoneDto>;
    update(currentUser: AuthenticatedUserEntity, zoneId: string, body: UpdateZoneDto): Promise<ZoneDto>;
}
