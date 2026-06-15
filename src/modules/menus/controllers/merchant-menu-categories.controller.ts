import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateMenuCategoryDto } from '../dto/create-menu-category.dto';
import { MenuCategoryDto } from '../dto/menu-category.dto';
import { UpdateMenuCategoryDto } from '../dto/update-menu-category.dto';
import { MerchantMenuCategoriesService } from '../services/merchant-menu-categories.service';

@ApiTags('merchant-menu-categories')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/menu/categories')
export class MerchantMenuCategoriesController {
  constructor(
    private readonly merchantMenuCategoriesService: MerchantMenuCategoriesService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantMenuCategories',
    summary: 'List categories for a merchant-owned branch',
  })
  @ApiOkResponse({
    description: 'Returns menu categories owned by the requested merchant branch.',
    type: MenuCategoryDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantMenuCategoriesService.listBranchCategories(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantMenuCategory',
    summary: 'Return one menu category for a merchant-owned branch',
  })
  @ApiOkResponse({
    description: 'Returns one menu category scoped to the requested branch.',
    type: MenuCategoryDto,
  })
  @Get(':categoryId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.merchantMenuCategoriesService.getBranchCategory(
      currentUser,
      branchId,
      categoryId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantMenuCategory',
    summary: 'Create a menu category for a merchant-owned branch',
  })
  @ApiBody({ type: CreateMenuCategoryDto })
  @ApiCreatedResponse({
    description: 'Creates and returns a menu category for the requested branch.',
    type: MenuCategoryDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: CreateMenuCategoryDto,
  ) {
    return this.merchantMenuCategoriesService.createBranchCategory(
      currentUser,
      branchId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantMenuCategory',
    summary: 'Update a menu category for a merchant-owned branch',
  })
  @ApiBody({ type: UpdateMenuCategoryDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested menu category.',
    type: MenuCategoryDto,
  })
  @Patch(':categoryId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateMenuCategoryDto,
  ) {
    return this.merchantMenuCategoriesService.updateBranchCategory(
      currentUser,
      branchId,
      categoryId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'deleteMerchantMenuCategory',
    summary: 'Delete a menu category from a merchant-owned branch',
  })
  @ApiNoContentResponse({ description: 'Menu category deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':categoryId')
  delete(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.merchantMenuCategoriesService.deleteBranchCategory(
      currentUser,
      branchId,
      categoryId,
    );
  }
}
