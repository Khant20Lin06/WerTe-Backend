import { AddressOwnershipEntity, AddressOwnershipRecord } from '../entities/address-ownership.entity';
import { AddressesRepository } from '../repositories/addresses.repository';
export declare class AddressesService {
    private readonly addressesRepository;
    constructor(addressesRepository: AddressesRepository);
    findById(id: string): Promise<AddressOwnershipRecord | null>;
    listByCustomerProfileId(customerProfileId: string): Promise<AddressOwnershipRecord[]>;
    findDefaultByCustomerProfileId(customerProfileId: string): Promise<AddressOwnershipRecord | null>;
    findOwnedByUserId(userId: string, addressId: string): Promise<AddressOwnershipRecord | null>;
    buildOwnership(address: AddressOwnershipRecord): AddressOwnershipEntity;
    belongsToUser(address: AddressOwnershipRecord, userId: string): boolean;
    belongsToCustomerProfile(address: AddressOwnershipRecord, customerProfileId: string): boolean;
}
