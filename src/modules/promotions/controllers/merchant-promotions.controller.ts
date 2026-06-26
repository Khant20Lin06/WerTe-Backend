import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { PromotionDto } from '../dto/promotion.dto';
import { MerchantPromotionsService } from '../services/merchant-promotions.service';

@ApiTags('merchant-promotions')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/branches/:branchId/promotions')
export class MerchantPromotionsController {
  constructor(
    private readonly merchantPromotionsService: MerchantPromotionsService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantBranchPromotions',
    summary: 'List promotions for a merchant-owned branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier owned by the authenticated merchant.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description: 'Returns promotions configured for the merchant-owned branch.',
    type: PromotionDto,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
  ) {
    return this.merchantPromotionsService.listBranchPromotions(
      currentUser,
      branchId,
    );
  }

  @ApiOperation({
    operationId: 'getMerchantBranchPromotion',
    summary: 'Return one promotion for a merchant-owned branch',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch identifier owned by the authenticated merchant.',
    example: 'branch_1',
  })
  @ApiParam({
    name: 'promotionId',
    description: 'Promotion identifier scoped to the branch.',
    example: 'promo_1',
  })
  @ApiOkResponse({
    description: 'Returns one promotion configured for the branch.',
    type: PromotionDto,
  })
  @Get(':promotionId')
  get(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('promotionId') promotionId: string,
  ) {
    return this.merchantPromotionsService.getBranchPromotion(
      currentUser,
      branchId,
      promotionId,
    );
  }

  @ApiOperation({
    operationId: 'createMerchantBranchPromotion',
    summary: 'Create a promotion for a merchant-owned branch',
  })
  @ApiBody({ type: CreatePromotionDto })
  @ApiCreatedResponse({
    description: 'Creates and returns the requested branch promotion.',
    type: PromotionDto,
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: CreatePromotionDto,
  ) {
    return this.merchantPromotionsService.createBranchPromotion(
      currentUser,
      branchId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'updateMerchantBranchPromotion',
    summary: 'Update a promotion for a merchant-owned branch',
  })
  @ApiBody({ type: UpdatePromotionDto })
  @ApiOkResponse({
    description: 'Updates and returns the requested branch promotion.',
    type: PromotionDto,
  })
  @Patch(':promotionId')
  update(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('promotionId') promotionId: string,
    @Body() body: UpdatePromotionDto,
  ) {
    return this.merchantPromotionsService.updateBranchPromotion(
      currentUser,
      branchId,
      promotionId,
      body,
    );
  }

  @ApiOperation({
    operationId: 'deleteMerchantBranchPromotion',
    summary: 'Soft-delete a promotion for a merchant-owned branch',
  })
  @ApiNoContentResponse({ description: 'Promotion deleted successfully.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':promotionId')
  async delete(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('branchId') branchId: string,
    @Param('promotionId') promotionId: string,
  ): Promise<void> {
    await this.merchantPromotionsService.deleteBranchPromotion(
      currentUser,
      branchId,
      promotionId,
    );
  }
}
