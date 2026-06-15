import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminRiderListQueryDto } from '../dto/admin-rider-list.dto';
import { AdminUpdateRiderStatusDto } from '../dto/admin-update-rider-status.dto';
import { RiderProfileDto } from '../dto/rider-profile.dto';
import { AdminRiderManagementService } from '../services/admin-rider-management.service';

@ApiTags('admin-riders')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/riders')
export class AdminRidersController {
  constructor(
    private readonly adminRiderManagementService: AdminRiderManagementService,
  ) {}

  @ApiOperation({
    operationId: 'adminListRiders',
    summary: 'List all riders with optional status filter',
  })
  @ApiOkResponse({
    description: 'Returns list of rider profiles.',
    type: [RiderProfileDto],
  })
  @Get()
  listRiders(@Query() query: AdminRiderListQueryDto) {
    return this.adminRiderManagementService.listRiders(query.status);
  }

  @ApiOperation({
    operationId: 'adminUpdateRiderStatus',
    summary: 'Approve (ACTIVE) or suspend (SUSPENDED) a rider',
  })
  @ApiParam({ name: 'riderId', description: 'Rider identifier' })
  @ApiBody({ type: AdminUpdateRiderStatusDto })
  @ApiOkResponse({
    description: 'Returns the updated rider profile.',
    type: RiderProfileDto,
  })
  @Patch(':riderId/status')
  updateRiderStatus(
    @Param('riderId') riderId: string,
    @Body() body: AdminUpdateRiderStatusDto,
  ) {
    return this.adminRiderManagementService.updateRiderStatus(
      riderId,
      body.status,
    );
  }
}
