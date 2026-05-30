import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import { RiderOperationalSummaryDto } from '../dto/rider-operational-summary.dto';
import { RiderProfileDto } from '../dto/rider-profile.dto';
import { UpdateRiderProfileDto } from '../dto/update-rider-profile.dto';
import { RiderPolicyService } from '../policies/rider-policy.service';
import { RidersRepository } from '../repositories/riders.repository';
import { RidersService } from './riders.service';
export declare class RiderAccountService {
    private readonly ridersService;
    private readonly ridersRepository;
    private readonly riderPolicyService;
    constructor(ridersService: RidersService, ridersRepository: RidersRepository, riderPolicyService: RiderPolicyService);
    getCurrentRiderProfile(currentUser: AuthenticatedUserEntity): Promise<RiderProfileDto>;
    updateCurrentRiderProfile(currentUser: AuthenticatedUserEntity, payload: UpdateRiderProfileDto): Promise<RiderProfileDto>;
    getOperationalSummary(currentUser: AuthenticatedUserEntity): Promise<RiderOperationalSummaryDto>;
    resolveOwnedRider(currentUser: AuthenticatedUserEntity): Promise<RiderOwnershipRecord>;
}
