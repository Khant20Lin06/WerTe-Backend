import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';
export declare class CustomerProfilePolicyService {
    canAccessProfile(currentUser: AuthenticatedUserEntity, profile: CustomerProfileOwnershipRecord): boolean;
}
