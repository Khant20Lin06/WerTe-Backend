import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { IngestRiderLocationDto } from '../dto/ingest-rider-location.dto';
import { RiderLocationDto } from '../dto/rider-location.dto';
import { RiderLocationService } from '../services/rider-location.service';
export declare class RiderLocationController {
    private readonly riderLocationService;
    constructor(riderLocationService: RiderLocationService);
    ingest(currentUser: AuthenticatedUserEntity, body: IngestRiderLocationDto): Promise<RiderLocationDto>;
}
