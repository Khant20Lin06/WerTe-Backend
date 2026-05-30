import { Module } from '@nestjs/common';

import { CustomerProfileController } from './controllers/customer-profile.controller';
import { CustomerProfilePolicyService } from './policies/customer-profile-policy.service';
import { CustomerProfilesRepository } from './repositories/customer-profiles.repository';
import { CustomerProfileAccountService } from './services/customer-profile-account.service';
import { CustomerProfilesService } from './services/customer-profiles.service';

@Module({
  controllers: [CustomerProfileController],
  providers: [
    CustomerProfilesRepository,
    CustomerProfilesService,
    CustomerProfileAccountService,
    CustomerProfilePolicyService,
  ],
  exports: [CustomerProfilesService],
})
export class CustomerProfilesModule {}
