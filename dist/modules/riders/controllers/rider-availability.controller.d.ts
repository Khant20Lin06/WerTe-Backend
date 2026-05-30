import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderAvailabilityDto } from '../dto/rider-availability.dto';
import { RiderAvailabilityService } from '../services/rider-availability.service';
export declare class RiderAvailabilityController {
    private readonly riderAvailabilityService;
    constructor(riderAvailabilityService: RiderAvailabilityService);
    getCurrentAvailability(currentUser: AuthenticatedUserEntity): Promise<RiderAvailabilityDto>;
    markOnline(currentUser: AuthenticatedUserEntity): Promise<RiderAvailabilityDto>;
    markOffline(currentUser: AuthenticatedUserEntity): Promise<RiderAvailabilityDto>;
}
