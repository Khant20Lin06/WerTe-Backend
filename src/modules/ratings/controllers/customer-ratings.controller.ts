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
import { CreateRatingDto, RatingDto, toRatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';

@ApiTags('customer-ratings')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/orders/:orderId/ratings')
export class CustomerRatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @ApiOperation({ operationId: 'createCustomerRating', summary: 'Rate rider or branch after delivery' })
  @ApiParam({ name: 'orderId' })
  @ApiBody({ type: CreateRatingDto })
  @ApiCreatedResponse({ type: RatingDto })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() dto: CreateRatingDto,
  ): Promise<RatingDto> {
    const rating = await this.ratingsService.createCustomerRating(
      user.actorContext.customerProfileId!,
      orderId,
      dto,
    );
    return toRatingDto(rating);
  }

  @ApiOperation({ operationId: 'getOrderRatings', summary: 'Get ratings for an order' })
  @ApiParam({ name: 'orderId' })
  @ApiOkResponse({ type: [RatingDto] })
  @Get()
  async list(
    @Param('orderId') orderId: string,
  ): Promise<RatingDto[]> {
    const ratings = await this.ratingsService.getOrderRatings(orderId);
    return ratings.map(toRatingDto);
  }
}
