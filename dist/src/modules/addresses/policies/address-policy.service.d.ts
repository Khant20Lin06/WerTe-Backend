import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddressOwnershipRecord } from '../entities/address-ownership.entity';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';
export declare class AddressPolicyService {
    canListAddresses(currentUser: AuthenticatedUserEntity, profile: CustomerProfileOwnershipRecord): boolean;
    canManageAddress(currentUser: AuthenticatedUserEntity, address: AddressOwnershipRecord): boolean;
}
