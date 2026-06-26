import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfilesService } from '../../customer-profiles/services/customer-profiles.service';
import { AddressDto } from '../dto/address.dto';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressPolicyService } from '../policies/address-policy.service';
import { AddressesRepository } from '../repositories/addresses.repository';
export declare class CustomerAddressesService {
    private readonly prisma;
    private readonly customerProfilesService;
    private readonly addressesRepository;
    private readonly addressPolicyService;
    constructor(prisma: PrismaService, customerProfilesService: CustomerProfilesService, addressesRepository: AddressesRepository, addressPolicyService: AddressPolicyService);
    listCurrentCustomerAddresses(currentUser: AuthenticatedUserEntity): Promise<AddressDto[]>;
    createCurrentCustomerAddress(currentUser: AuthenticatedUserEntity, payload: CreateAddressDto): Promise<AddressDto>;
    updateCurrentCustomerAddress(currentUser: AuthenticatedUserEntity, addressId: string, payload: UpdateAddressDto): Promise<AddressDto>;
    deleteCurrentCustomerAddress(currentUser: AuthenticatedUserEntity, addressId: string): Promise<{
        deletedAddressId: string;
    }>;
    private resolveCurrentCustomerProfile;
    private resolveOwnedAddress;
}
