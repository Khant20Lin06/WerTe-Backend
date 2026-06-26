import { UserStatus } from '@prisma/client';
import { AdminCustomerListQueryDto } from '../dto/admin-customer-list.dto';
import { CustomerProfileDto } from '../dto/customer-profile.dto';
import { AdminCustomerManagementService } from '../services/admin-customer-management.service';
declare class AdminUpdateCustomerStatusDto {
    status: UserStatus;
}
export declare class AdminCustomersController {
    private readonly adminCustomerManagementService;
    constructor(adminCustomerManagementService: AdminCustomerManagementService);
    listCustomers(query: AdminCustomerListQueryDto): Promise<CustomerProfileDto[]>;
    updateCustomerStatus(customerId: string, body: AdminUpdateCustomerStatusDto): Promise<CustomerProfileDto>;
}
export {};
