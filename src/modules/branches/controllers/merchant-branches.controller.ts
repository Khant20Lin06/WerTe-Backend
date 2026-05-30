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
import { BranchDto } from '../dto/branch.dto';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { MerchantBranchesService } from '../services/merchant-branches.service';

@ApiTags('merchant-branches')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches')
export class MerchantBranchesController {
  constructor(
    private readonly merchantBranchesService: MerchantBranchesService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantBranches',
    summary: 'List branches owned by the authenticated merchant',
  })
  @ApiOkResponse({
    description: 'Returns branches owned by the authenticated merchant.',
    type: BranchDto,
    isArray: true,
  })
  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.merchantBranchesService.listCurrentMerchantBranches(currentUser);
  }

  @ApiOperation({
    operationId: 'getMerchantBranch',
    summary: 'Return a branch owned by the authenticated merchant',
  })
  @ApiOkResponse({
    description: 'Returns a single branch owned by the authenticated merchant.',
    type: BranchDto,
  })
  @Get(':branchId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantBranchesService.getCurrentMerchantBranch(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantBranch',
    summary: 'Create a new branch for the authenticated merchant',
  })
  @ApiBody({ type: CreateBranchDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a new branch owned by the merchant.',
    type: BranchDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: CreateBranchDto,
  ) {
    return this.merchantBranchesService.createCurrentMerchantBranch(
      currentUser,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantBranch',
    summary: 'Update a branch owned by the authenticated merchant',
  })
  @ApiBody({ type: UpdateBranchDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested merchant-owned branch.',
    type: BranchDto,
  })
  @Patch(':branchId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: UpdateBranchDto,
  ) {
    return this.merchantBranchesService.updateCurrentMerchantBranch(
      currentUser,
      branchId,
      body,
    );
  }
}
