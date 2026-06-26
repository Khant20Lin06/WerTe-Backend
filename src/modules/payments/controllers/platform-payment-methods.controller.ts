import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentMethod, UserRole } from '@prisma/client';

import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { PlatformPaymentMethodsRepository } from '../repositories/platform-payment-methods.repository';

class UpsertPaymentMethodDto {
  method!: PaymentMethod;
  displayName!: string;
  description?: string | null;
  isEnabled!: boolean;
  sortOrder?: number;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    instructions?: string;
  } | null;
}

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PlatformPaymentMethodsController {
  constructor(
    private readonly repo: PlatformPaymentMethodsRepository,
  ) {}

  /** Public — customer app fetches enabled methods at checkout */
  @Public()
  @ApiOperation({ summary: 'List enabled payment methods' })
  @Get()
  async listEnabled() {
    const methods = await this.repo.findEnabled();
    return methods.map(m => ({
      method: m.method,
      displayName: m.displayName,
      description: m.description,
      sortOrder: m.sortOrder,
      bankDetails: m.bankDetails,
    }));
  }

  /** Admin — list all methods including disabled */
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list all payment methods' })
  @Get('admin')
  async listAll() {
    return this.repo.findAll();
  }

  /** Admin — enable/disable/configure a payment method */
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: update payment method config' })
  @Put('admin')
  async upsert(@Body() body: UpsertPaymentMethodDto) {
    return this.repo.upsert(body.method, {
      displayName: body.displayName,
      description: body.description,
      isEnabled: body.isEnabled,
      sortOrder: body.sortOrder,
      bankDetails: body.bankDetails as any,
    });
  }
}
