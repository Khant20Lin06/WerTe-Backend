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
import { RiderOperationalSummaryDto } from '../dto/rider-operational-summary.dto';
import { RiderProfileDto } from '../dto/rider-profile.dto';
import { UpdateRiderProfileDto } from '../dto/update-rider-profile.dto';
import { RiderAccountService } from '../services/rider-account.service';

@ApiTags('rider-profile')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider/profile')
export class RiderProfileController {
  constructor(private readonly riderAccountService: RiderAccountService) {}

  @ApiOperation({
    operationId: 'getRiderProfile',
    summary: 'Return the authenticated rider profile',
  })
  @ApiOkResponse({
    description: 'Returns the rider profile owned by the authenticated rider.',
    type: RiderProfileDto,
  })
  @Get()
  getCurrentProfile(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getCurrentRiderProfile(currentUser);
  }

  @ApiOperation({
    operationId: 'updateRiderProfile',
    summary: 'Update the authenticated rider profile',
  })
  @ApiBody({ type: UpdateRiderProfileDto })
  @ApiOkResponse({
    description: 'Updates and returns the authenticated rider profile.',
    type: RiderProfileDto,
  })
  @Patch()
  updateCurrentProfile(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: UpdateRiderProfileDto,
  ) {
    return this.riderAccountService.updateCurrentRiderProfile(currentUser, body);
  }

  @ApiOperation({
    operationId: 'getRiderOperationalSummary',
    summary: 'Return the operational summary for the authenticated rider',
  })
  @ApiOkResponse({
    description:
      'Returns rider operational fields that later dispatch and availability flows can bootstrap from.',
    type: RiderOperationalSummaryDto,
  })
  @Get('operational-summary')
  getOperationalSummary(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAccountService.getOperationalSummary(currentUser);
  }
}
