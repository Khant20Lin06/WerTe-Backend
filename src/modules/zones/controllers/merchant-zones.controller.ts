import { Controller, Get } from '@nestjs/common';
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
import { ZoneDto } from '../dto/zone.dto';
import { ZoneManagementService } from '../services/zone-management.service';

@ApiTags('merchant-zones')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/zones')
export class MerchantZonesController {
  constructor(private readonly zoneManagementService: ZoneManagementService) {}

  @ApiOperation({
    operationId: 'listMerchantActiveZones',
    summary: 'List active zones available to merchant branch workflows',
  })
  @ApiOkResponse({
    description:
      'Returns active zones that merchant operators can assign to branches.',
    type: ZoneDto,
    isArray: true,
  })
  @Get('active')
  listActive(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.zoneManagementService.listActiveZones(currentUser);
  }
}
