import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  DeliveryDetailDto,
  toDeliveryDetailDto,
} from '../dto/delivery-detail.dto';
import { RiderDeliveryActionDto } from '../dto/rider-delivery-action.dto';
import { RiderFailedDeliveryDto } from '../dto/rider-failed-delivery.dto';
import { RiderDeliveryActionsService } from '../services/rider-delivery-actions.service';
import { DeliveryQueryService } from '../services/delivery-query.service';

@ApiTags('rider-deliveries')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider')
export class RiderDeliveriesController {
  constructor(
    private readonly deliveryQueryService: DeliveryQueryService,
    private readonly riderDeliveryActionsService: RiderDeliveryActionsService,
  ) {}

  @ApiOperation({
    operationId: 'getRiderActiveDelivery',
    summary: 'Get the active delivery assigned to the authenticated rider',
  })
  @ApiOkResponse({
    description:
      'Returns the active delivery snapshot for the authenticated rider when one exists.',
    type: DeliveryDetailDto,
  })
  @Get('deliveries/active')
  async active(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    const delivery =
      await this.deliveryQueryService.getRiderActiveDelivery(currentUser);

    return delivery === null ? null : toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'getRiderDeliveryDetail',
    summary: 'Get a delivery detail visible to the authenticated rider',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Delivery identifier assigned to the authenticated rider.',
    example: 'delivery_1',
  })
  @ApiOkResponse({
    description:
      'Returns the delivery detail visible to the authenticated rider.',
    type: DeliveryDetailDto,
  })
  @Get('deliveries/:deliveryId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
  ) {
    const delivery = await this.deliveryQueryService.getRiderDeliveryDetail(
      currentUser,
      deliveryId,
    );

    return toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'acceptRiderDeliveryRequest',
    summary: 'Accept a rider delivery assignment request',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Assigned delivery request identifier.',
    example: 'delivery_1',
  })
  @ApiOkResponse({
    description:
      'Accepts the rider delivery request and returns the updated delivery snapshot.',
    type: DeliveryDetailDto,
  })
  @Post('delivery-requests/:deliveryId/accept')
  async accept(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
  ) {
    const delivery =
      await this.riderDeliveryActionsService.acceptCurrentRiderDeliveryRequest(
        currentUser,
        {
          deliveryId,
        },
      );

    return toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'rejectRiderDeliveryRequest',
    summary: 'Reject a rider delivery assignment request',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Assigned delivery request identifier.',
    example: 'delivery_1',
  })
  @ApiBody({ type: RiderDeliveryActionDto, required: false })
  @ApiOkResponse({
    description:
      'Rejects the rider delivery request and returns the updated delivery snapshot.',
    type: DeliveryDetailDto,
  })
  @Post('delivery-requests/:deliveryId/reject')
  async reject(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
    @Body() body?: RiderDeliveryActionDto,
  ) {
    const delivery =
      await this.riderDeliveryActionsService.rejectCurrentRiderDeliveryRequest(
        currentUser,
        {
          deliveryId,
          reasonCode: body?.reasonCode,
          note: body?.note,
        },
      );

    return toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'markRiderDeliveryPickedUp',
    summary: 'Mark a rider delivery as picked up',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Accepted delivery identifier.',
    example: 'delivery_1',
  })
  @ApiOkResponse({
    description:
      'Marks the delivery as picked up and returns the updated delivery snapshot.',
    type: DeliveryDetailDto,
  })
  @Post('deliveries/:deliveryId/picked-up')
  async markPickedUp(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
  ) {
    const delivery =
      await this.riderDeliveryActionsService.markCurrentRiderPickedUp(
        currentUser,
        {
          deliveryId,
        },
      );

    return toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'markRiderDeliveryOnTheWay',
    summary: 'Mark a rider delivery as on the way',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Picked-up delivery identifier.',
    example: 'delivery_1',
  })
  @ApiOkResponse({
    description:
      'Marks the delivery as on the way and returns the updated delivery snapshot.',
    type: DeliveryDetailDto,
  })
  @Post('deliveries/:deliveryId/on-the-way')
  async markOnTheWay(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
  ) {
    const delivery =
      await this.riderDeliveryActionsService.markCurrentRiderOnTheWay(
        currentUser,
        {
          deliveryId,
        },
      );

    return toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'markRiderDeliveryDelivered',
    summary: 'Mark a rider delivery as delivered',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'In-transit delivery identifier.',
    example: 'delivery_1',
  })
  @ApiOkResponse({
    description:
      'Marks the delivery as delivered and returns the updated delivery snapshot.',
    type: DeliveryDetailDto,
  })
  @Post('deliveries/:deliveryId/delivered')
  async markDelivered(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
  ) {
    const delivery =
      await this.riderDeliveryActionsService.markCurrentRiderDelivered(
        currentUser,
        {
          deliveryId,
        },
      );

    return toDeliveryDetailDto(delivery);
  }

  @ApiOperation({
    operationId: 'markRiderDeliveryFailed',
    summary: 'Mark a rider delivery as failed',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Active delivery identifier.',
    example: 'delivery_1',
  })
  @ApiBody({ type: RiderFailedDeliveryDto })
  @ApiOkResponse({
    description:
      'Marks the delivery as failed and returns the updated delivery snapshot.',
    type: DeliveryDetailDto,
  })
  @ApiOperation({
    operationId: 'cancelRiderDeliveryPrePickup',
    summary: 'Cancel an accepted delivery before pickup',
  })
  @ApiParam({
    name: 'deliveryId',
    description: 'Accepted delivery identifier to cancel.',
    example: 'delivery_1',
  })
  @ApiBody({ type: RiderDeliveryActionDto, required: false })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('deliveries/:deliveryId/cancel')
  async cancelPrePickup(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
    @Body() body?: RiderDeliveryActionDto,
  ): Promise<void> {
    await this.riderDeliveryActionsService.cancelCurrentRiderDelivery(
      currentUser,
      {
        deliveryId,
        reasonCode: body?.reasonCode,
        note: body?.note,
      },
    );
  }

  @Post('deliveries/:deliveryId/failed')
  async markFailed(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deliveryId') deliveryId: string,
    @Body() body: RiderFailedDeliveryDto,
  ) {
    const delivery =
      await this.riderDeliveryActionsService.failCurrentRiderDelivery(
        currentUser,
        {
          deliveryId,
          reasonCode: body.reasonCode,
          note: body.note,
        },
      );

    return toDeliveryDetailDto(delivery);
  }
}
