import { Controller, Get, Query } from '@nestjs/common';
import { UserRole, RatingTargetType } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { RatingDto, toRatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';

@ApiTags('admin-ratings')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/ratings')
export class AdminRatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @ApiOperation({ operationId: 'getAdminRatingsStats', summary: 'Platform-wide rating statistics' })
  @ApiOkResponse({ description: 'Aggregated rating stats by target type' })
  @Get('stats')
  async stats() {
    return this.ratingsService.getAdminStats();
  }

  @ApiOperation({ operationId: 'getAdminRatingsList', summary: 'List all ratings (paginated)' })
  @ApiQuery({ name: 'targetType', enum: RatingTargetType, required: false })
  @ApiQuery({ name: 'page',       type: Number, required: false })
  @ApiQuery({ name: 'limit',      type: Number, required: false })
  @ApiOkResponse({ type: [RatingDto] })
  @Get()
  async list(
    @Query('targetType') targetType?: RatingTargetType,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const { items, total } = await this.ratingsService.getAdminList({
      targetType,
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(200, Math.max(1, parseInt(limit, 10) || 50)),
    });
    return { items: items.map(toRatingDto), total };
  }

  @ApiOperation({ operationId: 'getTopRatedBranches', summary: 'Top rated branches' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @Get('top-branches')
  async topBranches(@Query('limit') limit = '10') {
    return this.ratingsService.getTopRatedBranches(
      Math.min(50, Math.max(1, parseInt(limit, 10) || 10)),
    );
  }

  @ApiOperation({ operationId: 'getTopRatedRiders', summary: 'Top rated riders' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @Get('top-riders')
  async topRiders(@Query('limit') limit = '10') {
    return this.ratingsService.getTopRatedRiders(
      Math.min(50, Math.max(1, parseInt(limit, 10) || 10)),
    );
  }
}
