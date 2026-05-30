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
import { MerchantProfileDto } from '../dto/merchant-profile.dto';
import { UpdateMerchantProfileDto } from '../dto/update-merchant-profile.dto';
import { MerchantAccountService } from '../services/merchant-account.service';

@ApiTags('merchant-profile')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/profile')
export class MerchantProfileController {
  constructor(
    private readonly merchantAccountService: MerchantAccountService,
  ) {}

  @ApiOperation({
    operationId: 'getMerchantProfile',
    summary: 'Return the authenticated merchant profile',
  })
  @ApiOkResponse({
    description: 'Returns the merchant profile owned by the authenticated user.',
    type: MerchantProfileDto,
  })
  @Get()
  getCurrentProfile(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.merchantAccountService.getCurrentMerchantProfile(currentUser);
  }

  @ApiOperation({
    operationId: 'updateMerchantProfile',
    summary: 'Update the authenticated merchant profile',
  })
  @ApiBody({ type: UpdateMerchantProfileDto })
  @ApiOkResponse({
    description: 'Updates and returns the authenticated merchant profile.',
    type: MerchantProfileDto,
  })
  @Patch()
  updateCurrentProfile(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: UpdateMerchantProfileDto,
  ) {
    return this.merchantAccountService.updateCurrentMerchantProfile(
      currentUser,
      body,
    );
  }
}
