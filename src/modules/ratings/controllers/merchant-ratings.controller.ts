import { Controller, Get, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { RatingDto, toRatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';

@ApiTags('merchant-ratings')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/orders/:orderId/ratings')
export class MerchantRatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @ApiOperation({
    operationId: 'getMerchantOrderRatings',
    summary: 'Get ratings for a delivered order (merchant view)',
  })
  @ApiParam({ name: 'orderId' })
  @ApiOkResponse({ type: [RatingDto] })
  @Get()
  async list(@Param('orderId') orderId: string): Promise<RatingDto[]> {
    const ratings = await this.ratingsService.getOrderRatings(orderId);
    return ratings.map(toRatingDto);
  }
}
