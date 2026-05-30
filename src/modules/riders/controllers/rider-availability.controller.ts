import { Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderAvailabilityDto } from '../dto/rider-availability.dto';
import { RiderAvailabilityService } from '../services/rider-availability.service';

@ApiTags('rider-availability')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider/availability')
export class RiderAvailabilityController {
  constructor(
    private readonly riderAvailabilityService: RiderAvailabilityService,
  ) {}

  @ApiOperation({
    operationId: 'getRiderAvailability',
    summary: 'Return the authenticated rider availability snapshot',
  })
  @ApiOkResponse({
    description:
      'Returns the rider availability state owned by the authenticated rider.',
    type: RiderAvailabilityDto,
  })
  @Get()
  getCurrentAvailability(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAvailabilityService.getCurrentAvailability(currentUser);
  }

  @ApiOperation({
    operationId: 'markRiderOnline',
    summary: 'Mark the authenticated rider online and available for dispatch',
  })
  @ApiOkResponse({
    description:
      'Marks the rider online and available, then returns the updated availability snapshot.',
    type: RiderAvailabilityDto,
  })
  @Post('online')
  markOnline(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAvailabilityService.markCurrentRiderOnline(currentUser);
  }

  @ApiOperation({
    operationId: 'markRiderOffline',
    summary: 'Mark the authenticated rider offline',
  })
  @ApiOkResponse({
    description:
      'Marks the rider offline and unavailable, then returns the updated availability snapshot.',
    type: RiderAvailabilityDto,
  })
  @Post('offline')
  markOffline(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.riderAvailabilityService.markCurrentRiderOffline(currentUser);
  }
}
