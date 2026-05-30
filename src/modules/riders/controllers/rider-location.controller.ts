import { Body, Controller, Post } from '@nestjs/common';
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
import { IngestRiderLocationDto } from '../dto/ingest-rider-location.dto';
import { RiderLocationDto } from '../dto/rider-location.dto';
import { RiderLocationService } from '../services/rider-location.service';

@ApiTags('rider-location')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider/location')
export class RiderLocationController {
  constructor(private readonly riderLocationService: RiderLocationService) {}

  @ApiOperation({
    operationId: 'ingestRiderLocation',
    summary: 'Persist a rider location snapshot and append location history',
  })
  @ApiBody({ type: IngestRiderLocationDto })
  @ApiOkResponse({
    description:
      'Stores the current rider location snapshot and appends location history when the update is not a duplicate.',
    type: RiderLocationDto,
  })
  @Post()
  ingest(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: IngestRiderLocationDto,
  ) {
    return this.riderLocationService.ingestCurrentRiderLocation(
      currentUser,
      body,
    );
  }
}
