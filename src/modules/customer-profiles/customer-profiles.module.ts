import { Module } from '@nestjs/common';

import { AdminCustomersController } from './controllers/admin-customers.controller';
import { CustomerProfileController } from './controllers/customer-profile.controller';
import { CustomerProfilePolicyService } from './policies/customer-profile-policy.service';
import { CustomerProfilesRepository } from './repositories/customer-profiles.repository';
import { AdminCustomerManagementService } from './services/admin-customer-management.service';
import { CustomerProfileAccountService } from './services/customer-profile-account.service';
import { CustomerProfilesService } from './services/customer-profiles.service';

@Module({
  controllers: [CustomerProfileController, AdminCustomersController],
  providers: [
    CustomerProfilesRepository,
    CustomerProfilesService,
    CustomerProfileAccountService,
    CustomerProfilePolicyService,
    AdminCustomerManagementService,
  ],
  exports: [CustomerProfilesService],
})
export class CustomerProfilesModule {}
