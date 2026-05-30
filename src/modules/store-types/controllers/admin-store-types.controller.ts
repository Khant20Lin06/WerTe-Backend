import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { CreateStoreTypeDto } from '../dto/create-store-type.dto';
import { StoreTypeDto } from '../dto/store-type.dto';
import { UpdateStoreTypeDto } from '../dto/update-store-type.dto';
import { StoreTypeManagementService } from '../services/store-type-management.service';

@ApiTags('admin-store-types')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/store-types')
export class AdminStoreTypesController {
  constructor(
    private readonly storeTypeManagementService: StoreTypeManagementService,
  ) {}

  @ApiOperation({
    operationId: 'listAdminStoreTypes',
    summary: 'List store types for the administrative control plane',
  })
  @ApiOkResponse({
    description: 'Returns all store types with usage counters.',
    type: StoreTypeDto,
    isArray: true,
  })
  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.storeTypeManagementService.listStoreTypes(currentUser);
  }

  @ApiOperation({
    operationId: 'getAdminStoreType',
    summary: 'Return one administrative store type record',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_restaurant',
  })
  @ApiOkResponse({
    description: 'Returns a single store type with usage counters.',
    type: StoreTypeDto,
  })
  @Get(':storeTypeId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('storeTypeId') storeTypeId: string,
  ) {
    return this.storeTypeManagementService.getStoreType(currentUser, storeTypeId);
  }

  @ApiOperation({
    operationId: 'createAdminStoreType',
    summary: 'Create a new dynamic store type',
  })
  @ApiBody({ type: CreateStoreTypeDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a new store type.',
    type: StoreTypeDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: CreateStoreTypeDto,
  ) {
    return this.storeTypeManagementService.createStoreType(currentUser, body);
  }

  @ApiOperation({
    operationId: 'updateAdminStoreType',
    summary: 'Update an existing dynamic store type',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_restaurant',
  })
  @ApiBody({ type: UpdateStoreTypeDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested store type.',
    type: StoreTypeDto,
  })
  @Patch(':storeTypeId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('storeTypeId') storeTypeId: string,
    @Body() body: UpdateStoreTypeDto,
  ) {
    return this.storeTypeManagementService.updateStoreType(
      currentUser,
      storeTypeId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'archiveAdminStoreType',
    summary: 'Archive a dynamic store type',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_restaurant',
  })
  @ApiOkResponse({
    description: 'Archives the store type and returns the updated snapshot.',
    type: StoreTypeDto,
  })
  @Post(':storeTypeId/archive')
  archive(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('storeTypeId') storeTypeId: string,
  ) {
    return this.storeTypeManagementService.archiveStoreType(
      currentUser,
      storeTypeId,
    );
  }

  @ApiOperation({
    operationId: 'activateAdminStoreType',
    summary: 'Re-activate a dynamic store type',
  })
  @ApiParam({
    name: 'storeTypeId',
    description: 'Store type identifier visible to the administrative control plane.',
    example: 'store_type_restaurant',
  })
  @ApiOkResponse({
    description: 'Re-activates the store type and returns the updated snapshot.',
    type: StoreTypeDto,
  })
  @Post(':storeTypeId/activate')
  activate(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('storeTypeId') storeTypeId: string,
  ) {
    return this.storeTypeManagementService.activateStoreType(
      currentUser,
      storeTypeId,
    );
  }
}
