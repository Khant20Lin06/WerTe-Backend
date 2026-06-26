import { UserStatus } from '@prisma/client';
import { CustomerProfileDto } from '../dto/customer-profile.dto';
import { CustomerProfilesRepository } from '../repositories/customer-profiles.repository';
export declare class AdminCustomerManagementService {
    private readonly customerProfilesRepository;
    constructor(customerProfilesRepository: CustomerProfilesRepository);
    listCustomers(opts: {
        status?: UserStatus;
        search?: string;
    }): Promise<CustomerProfileDto[]>;
    updateCustomerStatus(customerId: string, status: UserStatus): Promise<CustomerProfileDto>;
}
