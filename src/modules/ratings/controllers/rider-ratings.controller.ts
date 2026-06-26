import { Body, Controller, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateRatingDto, RatingDto, toRatingDto } from '../dto/create-rating.dto';
import { RatingsService } from '../ratings.service';

@ApiTags('rider-ratings')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider/deliveries/:deliveryId/ratings')
export class RiderRatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @ApiOperation({ operationId: 'createRiderRating', summary: 'Rate customer after delivery' })
  @ApiParam({ name: 'deliveryId' })
  @ApiBody({ type: CreateRatingDto })
  @ApiCreatedResponse({ type: RatingDto })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
    @Body() dto: CreateRatingDto,
  ): Promise<RatingDto> {
    const rating = await this.ratingsService.createRiderRating(
      user.actorContext.riderId!,
      deliveryId,
      dto,
    );
    return toRatingDto(rating);
  }
}
