import { Controller, Get, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderDetailDto, toOrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto, toOrderSummaryDto } from '../dto/order-summary.dto';
import { OrderQueryService } from '../services/order-query.service';

@ApiTags('rider-orders')
@ApiBearerAuth('access-token')
@Roles(UserRole.RIDER)
@Controller('rider/orders')
export class RiderOrdersController {
  constructor(private readonly orderQueryService: OrderQueryService) {}

  @ApiOperation({
    operationId: 'listRiderOrders',
    summary: 'List rider-visible orders',
  })
  @ApiOkResponse({
    description:
      'Returns orders visible to the authenticated rider, including active delivery context.',
    type: OrderSummaryDto,
    isArray: true,
  })
  @Get()
  async list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    const orders = await this.orderQueryService.listRiderOrders(currentUser);

    return orders.map((order) => toOrderSummaryDto(order));
  }

  @ApiOperation({
    operationId: 'getRiderOrderDetail',
    summary: 'Get rider order details',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated rider.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns the full order detail visible to the authenticated rider.',
    type: OrderDetailDto,
  })
  @Get(':orderId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.orderQueryService.getRiderOrderDetail(
      currentUser,
      orderId,
    );

    return toOrderDetailDto(order);
  }
}
