import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddressDto } from '../dto/address.dto';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { CustomerAddressesService } from '../services/customer-addresses.service';
export declare class CustomerAddressesController {
    private readonly customerAddressesService;
    constructor(customerAddressesService: CustomerAddressesService);
    list(currentUser: AuthenticatedUserEntity): Promise<AddressDto[]>;
    create(currentUser: AuthenticatedUserEntity, body: CreateAddressDto): Promise<AddressDto>;
    update(currentUser: AuthenticatedUserEntity, addressId: string, body: UpdateAddressDto): Promise<AddressDto>;
    remove(currentUser: AuthenticatedUserEntity, addressId: string): Promise<{
        deletedAddressId: string;
    }>;
}
