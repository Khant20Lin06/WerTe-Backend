import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerProfileDto } from '../dto/customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { CustomerProfileAccountService } from '../services/customer-profile-account.service';

@ApiTags('customer-profile')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/profile')
export class CustomerProfileController {
  constructor(
    private readonly customerProfileAccountService: CustomerProfileAccountService,
  ) {}

  @ApiOperation({
    operationId: 'getCustomerProfile',
    summary: 'Return the authenticated customer profile',
  })
  @ApiOkResponse({
    description: 'Returns the profile owned by the authenticated customer.',
    type: CustomerProfileDto,
  })
  @Get()
  getCurrentProfile(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.customerProfileAccountService.getCurrentProfile(currentUser);
  }

  @ApiOperation({
    operationId: 'updateCustomerProfile',
    summary: 'Update the authenticated customer profile',
  })
  @ApiBody({ type: UpdateCustomerProfileDto })
  @ApiOkResponse({
    description: 'Updates and returns the authenticated customer profile.',
    type: CustomerProfileDto,
  })
  @Patch()
  updateCurrentProfile(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: UpdateCustomerProfileDto,
  ) {
    return this.customerProfileAccountService.updateCurrentProfile(
      currentUser,
      body,
    );
  }
}
