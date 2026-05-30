import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfileDto } from '../dto/customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { CustomerProfileAccountService } from '../services/customer-profile-account.service';
export declare class CustomerProfileController {
    private readonly customerProfileAccountService;
    constructor(customerProfileAccountService: CustomerProfileAccountService);
    getCurrentProfile(currentUser: AuthenticatedUserEntity): Promise<CustomerProfileDto>;
    updateCurrentProfile(currentUser: AuthenticatedUserEntity, body: UpdateCustomerProfileDto): Promise<CustomerProfileDto>;
}
