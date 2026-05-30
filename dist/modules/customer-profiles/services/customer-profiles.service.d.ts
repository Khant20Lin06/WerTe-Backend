import { CustomerProfileOwnershipEntity, CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';
import { CustomerProfilesRepository } from '../repositories/customer-profiles.repository';
export declare class CustomerProfilesService {
    private readonly customerProfilesRepository;
    constructor(customerProfilesRepository: CustomerProfilesRepository);
    findById(id: string): Promise<CustomerProfileOwnershipRecord | null>;
    findByUserId(userId: string): Promise<CustomerProfileOwnershipRecord | null>;
    findOwnedByUserId(userId: string, customerProfileId: string): Promise<CustomerProfileOwnershipRecord | null>;
    buildOwnership(profile: CustomerProfileOwnershipRecord): CustomerProfileOwnershipEntity;
    belongsToUser(profile: CustomerProfileOwnershipRecord, userId: string): boolean;
}
