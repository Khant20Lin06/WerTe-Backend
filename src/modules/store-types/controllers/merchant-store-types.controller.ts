import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AvailableStoreTypeDto } from '../dto/available-store-type.dto';
import { BranchStoreTypeDto } from '../dto/branch-store-type.dto';
import { RequestBranchStoreTypeDto } from '../dto/request-branch-store-type.dto';
import { MerchantStoreTypeRequestService } from '../services/merchant-store-type-request.service';

@ApiTags('merchant-store-types')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant')
export class MerchantStoreTypesController {
  constructor(
    private readonly merchantStoreTypeRequestService: MerchantStoreTypeRequestService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantAvailableStoreTypes',
    summary: 'List active store types available for merchant requests',
  })
  @ApiOkResponse({
    description: 'Returns active store types available to the authenticated merchant.',
    type: AvailableStoreTypeDto,
    isArray: true,
  })
  @Get('store-types')
  listAvailable(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.merchantStoreTypeRequestService.listAvailableStoreTypes(
      currentUser,
    );
  }

  @ApiOperation({
    operationId: 'listMerchantBranchStoreTypeRequests',
    summary: 'List store type assignments and requests for a merchant-owned branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier owned by the authenticated merchant.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description:
      'Returns branch store type assignments and their current approval statuses.',
    type: BranchStoreTypeDto,
    isArray: true,
  })
  @Get('branches/:branchId/store-types')
  listBranchAssignments(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantStoreTypeRequestService.listCurrentMerchantBranchStoreTypes(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'requestMerchantBranchStoreType',
    summary: 'Request a new store type assignment for a merchant-owned branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier owned by the authenticated merchant.',
    example: 'branch_1',
  })
  @ApiBody({ type: RequestBranchStoreTypeDto })
  @ApiCreatedResponse({
    description: 'Creates or re-submits a pending store type request for the branch.',
    type: BranchStoreTypeDto,
  })
  @Post('branches/:branchId/store-types')
  request(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: RequestBranchStoreTypeDto,
  ) {
    return this.merchantStoreTypeRequestService.requestCurrentMerchantBranchStoreType(
      currentUser,
      branchId,
      body,
    );
  }
}
