import { Module } from '@nestjs/common';

import { CustomerProfilesModule } from '../customer-profiles/customer-profiles.module';
import { CustomerAddressesController } from './controllers/customer-addresses.controller';
import { AddressPolicyService } from './policies/address-policy.service';
import { AddressesRepository } from './repositories/addresses.repository';
import { AddressesService } from './services/addresses.service';
import { CustomerAddressesService } from './services/customer-addresses.service';

@Module({
  imports: [CustomerProfilesModule],
  controllers: [CustomerAddressesController],
  providers: [
    AddressesRepository,
    AddressesService,
    CustomerAddressesService,
    AddressPolicyService,
  ],
  exports: [AddressesService],
})
export class AddressesModule {}
