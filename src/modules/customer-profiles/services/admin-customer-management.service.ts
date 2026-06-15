import { HttpStatus, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import {
  CustomerProfileDto,
  toCustomerProfileDto,
} from '../dto/customer-profile.dto';
import { CustomerProfilesRepository } from '../repositories/customer-profiles.repository';

@Injectable()
export class AdminCustomerManagementService {
  constructor(
    private readonly customerProfilesRepository: CustomerProfilesRepository,
  ) {}

  async listCustomers(opts: {
    status?: UserStatus;
    search?: string;
  }): Promise<CustomerProfileDto[]> {
    const profiles = await this.customerProfilesRepository.findAll(opts);
    return profiles.map(toCustomerProfileDto);
  }

  async updateCustomerStatus(
    customerId: string,
    status: UserStatus,
  ): Promise<CustomerProfileDto> {
    const existing = await this.customerProfilesRepository.findById(customerId);

    if (existing === null) {
      throw new AppException(
        `Customer '${customerId}' was not found.`,
        HttpStatus.NOT_FOUND,
        { code: ErrorCodes.notFound },
      );
    }

    const updated = await this.customerProfilesRepository.update(customerId, {
      user: { update: { status } },
    });

    return toCustomerProfileDto(updated);
  }
}
