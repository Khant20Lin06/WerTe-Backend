import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateZoneDto } from '../dto/create-zone.dto';
import { ZoneDto } from '../dto/zone.dto';
import { UpdateZoneDto } from '../dto/update-zone.dto';
import { ZonePolicyService } from '../policies/zone-policy.service';
import { ZonesRepository } from '../repositories/zones.repository';
export declare class ZoneManagementService {
    private readonly zonesRepository;
    private readonly zonePolicyService;
    constructor(zonesRepository: ZonesRepository, zonePolicyService: ZonePolicyService);
    listZones(currentUser: AuthenticatedUserEntity): Promise<ZoneDto[]>;
    getZone(currentUser: AuthenticatedUserEntity, zoneId: string): Promise<ZoneDto>;
    createZone(currentUser: AuthenticatedUserEntity, payload: CreateZoneDto): Promise<ZoneDto>;
    updateZone(currentUser: AuthenticatedUserEntity, zoneId: string, payload: UpdateZoneDto): Promise<ZoneDto>;
    listActiveZones(currentUser: AuthenticatedUserEntity): Promise<ZoneDto[]>;
    private assertCanManageZones;
    private assertCodeAvailable;
}
