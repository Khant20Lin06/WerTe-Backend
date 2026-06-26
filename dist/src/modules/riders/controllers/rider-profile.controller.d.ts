import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOperationalSummaryDto } from '../dto/rider-operational-summary.dto';
import { RiderProfileDto } from '../dto/rider-profile.dto';
import { UpdateRiderProfileDto } from '../dto/update-rider-profile.dto';
import { RiderAccountService } from '../services/rider-account.service';
export declare class RiderProfileController {
    private readonly riderAccountService;
    constructor(riderAccountService: RiderAccountService);
    getCurrentProfile(currentUser: AuthenticatedUserEntity): Promise<RiderProfileDto>;
    updateCurrentProfile(currentUser: AuthenticatedUserEntity, body: UpdateRiderProfileDto): Promise<RiderProfileDto>;
    getOperationalSummary(currentUser: AuthenticatedUserEntity): Promise<RiderOperationalSummaryDto>;
}
