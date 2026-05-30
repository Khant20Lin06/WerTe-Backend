import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateZoneDto } from '../dto/create-zone.dto';
import { UpdateZoneDto } from '../dto/update-zone.dto';
import { ZoneDto } from '../dto/zone.dto';
import { ZoneManagementService } from '../services/zone-management.service';

@ApiTags('admin-zones')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/zones')
export class AdminZonesController {
  constructor(private readonly zoneManagementService: ZoneManagementService) {}

  @ApiOperation({
    operationId: 'listAdminZones',
    summary: 'List zones for administrative management',
  })
  @ApiOkResponse({
    description: 'Returns all zones with branch usage counts.',
    type: ZoneDto,
    isArray: true,
  })
  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.zoneManagementService.listZones(currentUser);
  }

  @ApiOperation({
    operationId: 'getAdminZone',
    summary: 'Return one administrative zone record',
  })
  @ApiOkResponse({
    description: 'Returns a single zone with its current branch usage count.',
    type: ZoneDto,
  })
  @Get(':zoneId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('zoneId') zoneId: string,
  ) {
    return this.zoneManagementService.getZone(currentUser, zoneId);
  }

  @ApiOperation({
    operationId: 'createAdminZone',
    summary: 'Create a new delivery zone',
  })
  @ApiBody({ type: CreateZoneDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a new zone.',
    type: ZoneDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: CreateZoneDto,
  ) {
    return this.zoneManagementService.createZone(currentUser, body);
  }

  @ApiOperation({
    operationId: 'updateAdminZone',
    summary: 'Update an existing delivery zone',
  })
  @ApiBody({ type: UpdateZoneDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested zone.',
    type: ZoneDto,
  })
  @Patch(':zoneId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('zoneId') zoneId: string,
    @Body() body: UpdateZoneDto,
  ) {
    return this.zoneManagementService.updateZone(currentUser, zoneId, body);
  }
}
