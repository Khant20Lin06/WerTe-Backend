import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminBranchStoreTypeActionDto } from '../dto/admin-branch-store-type-action.dto';
import { BranchStoreTypeDto } from '../dto/branch-store-type.dto';
import { ListAdminBranchStoreTypesQueryDto } from '../dto/list-admin-branch-store-types-query.dto';
import { ManageBranchStoreTypeDto } from '../dto/manage-branch-store-type.dto';
import { StoreTypeManagementService } from '../services/store-type-management.service';

@ApiTags('admin-store-types')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminBranchStoreTypesController {
  constructor(
    private readonly storeTypeManagementService: StoreTypeManagementService,
  ) {}

  @ApiOperation({
    operationId: 'listAdminBranchStoreTypes',
    summary: 'List branch store type assignments visible to the admin control plane',
  })
  @ApiQuery({ name: 'branchId', required: false, example: 'branch_1' })
  @ApiQuery({
    name: 'storeTypeId',
    required: false,
    example: 'store_type_restaurant',
  })
  @ApiQuery({ name: 'status', required: false, example: 'PENDING' })
  @ApiOkResponse({
    description: 'Returns branch store type assignments filtered for the control plane.',
    type: BranchStoreTypeDto,
    isArray: true,
  })
  @Get('branch-store-types')
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListAdminBranchStoreTypesQueryDto,
  ) {
    return this.storeTypeManagementService.listBranchStoreTypes(
      currentUser,
      query,
    );
  }

  @ApiOperation({
    operationId: 'listAdminBranchStoreTypesByBranch',
    summary: 'List all store type assignments for a branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description: 'Returns branch store type assignments for the requested branch.',
    type: BranchStoreTypeDto,
    isArray: true,
  })
  @Get('branches/:branchId/store-types')
  listByBranch(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.storeTypeManagementService.listBranchStoreTypesByBranch(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'assignAdminBranchStoreType',
    summary: 'Assign a store type to a branch from the admin control plane',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiBody({ type: ManageBranchStoreTypeDto })
  @ApiCreatedResponse({
    description: 'Creates or updates the branch store type assignment.',
    type: BranchStoreTypeDto,
  })
  @Post('branches/:branchId/store-types')
  assign(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: ManageBranchStoreTypeDto,
  ) {
    return this.storeTypeManagementService.assignBranchStoreType(
      currentUser,
      branchId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'approveAdminBranchStoreType',
    summary: 'Approve a branch store type assignment',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_grocery',
  })
  @ApiBody({ type: AdminBranchStoreTypeActionDto, required: false })
  @ApiOkResponse({
    description: 'Approves the assignment and returns the updated snapshot.',
    type: BranchStoreTypeDto,
  })
  @Post('branches/:branchId/store-types/:storeTypeId/approve')
  approve(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('storeTypeId') storeTypeId: string,
    @Body() body: AdminBranchStoreTypeActionDto,
  ) {
    return this.storeTypeManagementService.approveBranchStoreType(
      currentUser,
      branchId,
      storeTypeId,
      body ?? {},
    );
  }

  @ApiOperation({
    operationId: 'rejectAdminBranchStoreType',
    summary: 'Reject a branch store type assignment',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_grocery',
  })
  @ApiBody({ type: AdminBranchStoreTypeActionDto, required: false })
  @ApiOkResponse({
    description: 'Rejects the assignment and returns the updated snapshot.',
    type: BranchStoreTypeDto,
  })
  @Post('branches/:branchId/store-types/:storeTypeId/reject')
  reject(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('storeTypeId') storeTypeId: string,
    @Body() body: AdminBranchStoreTypeActionDto,
  ) {
    return this.storeTypeManagementService.rejectBranchStoreType(
      currentUser,
      branchId,
      storeTypeId,
      body ?? {},
    );
  }

  @ApiOperation({
    operationId: 'hideAdminBranchStoreType',
    summary: 'Hide a branch store type assignment',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_grocery',
  })
  @ApiBody({ type: AdminBranchStoreTypeActionDto, required: false })
  @ApiOkResponse({
    description: 'Hides the assignment and returns the updated snapshot.',
    type: BranchStoreTypeDto,
  })
  @Post('branches/:branchId/store-types/:storeTypeId/hide')
  hide(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('storeTypeId') storeTypeId: string,
    @Body() body: AdminBranchStoreTypeActionDto,
  ) {
    return this.storeTypeManagementService.hideBranchStoreType(
      currentUser,
      branchId,
      storeTypeId,
      body ?? {},
    );
  }

  @ApiOperation({
    operationId: 'unhideAdminBranchStoreType',
    summary: 'Unhide and re-approve a branch store type assignment',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier visible to the administrative control plane.',
    example: 'branch_1',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_grocery',
  })
  @ApiBody({ type: AdminBranchStoreTypeActionDto, required: false })
  @ApiOkResponse({
    description: 'Unhides the assignment and returns the updated snapshot.',
    type: BranchStoreTypeDto,
  })
  @Post('branches/:branchId/store-types/:storeTypeId/unhide')
  unhide(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('storeTypeId') storeTypeId: string,
    @Body() body: AdminBranchStoreTypeActionDto,
  ) {
    return this.storeTypeManagementService.unhideBranchStoreType(
      currentUser,
      branchId,
      storeTypeId,
      body ?? {},
    );
  }
}
