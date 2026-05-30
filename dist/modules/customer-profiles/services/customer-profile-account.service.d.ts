import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfilePolicyService } from '../policies/customer-profile-policy.service';
import { CustomerProfilesRepository } from '../repositories/customer-profiles.repository';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { CustomerProfileDto } from '../dto/customer-profile.dto';
import { CustomerProfilesService } from './customer-profiles.service';
export declare class CustomerProfileAccountService {
    private readonly customerProfilesService;
    private readonly customerProfilesRepository;
    private readonly customerProfilePolicyService;
    constructor(customerProfilesService: CustomerProfilesService, customerProfilesRepository: CustomerProfilesRepository, customerProfilePolicyService: CustomerProfilePolicyService);
    getCurrentProfile(currentUser: AuthenticatedUserEntity): Promise<CustomerProfileDto>;
    updateCurrentProfile(currentUser: AuthenticatedUserEntity, payload: UpdateCustomerProfileDto): Promise<CustomerProfileDto>;
    private resolveOwnedProfile;
}
