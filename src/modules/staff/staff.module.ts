import { Module } from '@nestjs/common';

import { PasswordService } from '../auth/services/password.service';
import { MerchantStaffController } from './controllers/merchant-staff.controller';
import { StaffRepository } from './repositories/staff.repository';
import { StaffService } from './services/staff.service';

@Module({
  controllers: [MerchantStaffController],
  providers: [StaffService, StaffRepository, PasswordService],
  exports: [StaffService],
})
export class StaffModule {}
