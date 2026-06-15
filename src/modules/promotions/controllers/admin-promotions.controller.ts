import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { Roles } from '../../../common/decorators/roles.decorator';
import { CreatePromotionDto, UpdatePromotionDto } from '../dto/create-promotion.dto';
import { AdminPromotionDto } from '../dto/admin-promotion.dto';
import { AdminPromotionsService } from '../services/admin-promotions.service';

class AdminCreatePromotionDto extends CreatePromotionDto {
  @ApiProperty({ description: 'Branch to create the promotion for', example: 'branch_1' })
  @IsString()
  branchId!: string;
}

class AdminListPromotionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsOptional()
  @IsString()
  branchId?: string;
}

@ApiTags('admin-promotions')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/promotions')
export class AdminPromotionsController {
  constructor(
    private readonly adminPromotionsService: AdminPromotionsService,
  ) {}

  @ApiOperation({
    operationId: 'adminListPromotions',
    summary: 'List all promotions across all merchants',
  })
  @ApiOkResponse({ type: [AdminPromotionDto] })
  @Get()
  list(@Query() _query: AdminListPromotionsQueryDto) {
    return this.adminPromotionsService.listPromotions();
  }

  @ApiOperation({
    operationId: 'adminCreatePromotion',
    summary: 'Create a promotion for any branch',
  })
  @ApiBody({ type: AdminCreatePromotionDto })
  @ApiCreatedResponse({ type: AdminPromotionDto })
  @Post()
  create(@Body() body: AdminCreatePromotionDto) {
    const { branchId, ...rest } = body;
    return this.adminPromotionsService.createPromotion(branchId, rest as CreatePromotionDto);
  }

  @ApiOperation({
    operationId: 'adminUpdatePromotion',
    summary: 'Update or deactivate a promotion',
  })
  @ApiParam({ name: 'promotionId', description: 'Promotion identifier' })
  @ApiBody({ type: UpdatePromotionDto })
  @ApiOkResponse({ type: AdminPromotionDto })
  @Patch(':promotionId')
  update(
    @Param('promotionId') promotionId: string,
    @Body() body: UpdatePromotionDto,
  ) {
    return this.adminPromotionsService.updatePromotion(promotionId, body);
  }
}
