import { Controller, Get, Param, Query } from '@nestjs/common';
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
import { ListRiderOrdersQueryDto } from '../dto/list-rider-orders-query.dto';
import { OrderDetailDto, toOrderDetailDto } from '../dto/order-detail.dto';
import { RiderOrderListDto } from '../dto/rider-order-list.dto';
import { toOrderSummaryDto } from '../dto/order-summary.dto';
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
      'Returns a cursor-paginated page of orders visible to the authenticated rider, including active delivery context.',
    type: RiderOrderListDto,
  })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListRiderOrdersQueryDto,
  ): Promise<RiderOrderListDto> {
    const { orders, nextCursor, hasMore } =
      await this.orderQueryService.listRiderOrders(currentUser, {
        cursor: query.cursor,
        limit: query.limit,
      });

    return {
      data: orders.map((order) => toOrderSummaryDto(order)),
      nextCursor,
      hasMore,
    };
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
