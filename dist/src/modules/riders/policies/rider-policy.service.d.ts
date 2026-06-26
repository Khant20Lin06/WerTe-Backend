import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
export declare class RiderPolicyService {
    canAccessRider(currentUser: AuthenticatedUserEntity, rider: RiderOwnershipRecord): boolean;
}
