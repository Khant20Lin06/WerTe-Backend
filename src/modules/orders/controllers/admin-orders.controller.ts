import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminCancelOrderDto } from '../dto/admin-cancel-order.dto';
import { AdminUpdateOrderStatusDto } from '../dto/admin-update-order-status.dto';
import { OrderDetailDto, toOrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto, toOrderSummaryDto } from '../dto/order-summary.dto';
import { AdminOrderOperationsService } from '../services/admin-order-operations.service';
import { OrderQueryService } from '../services/order-query.service';

@ApiTags('admin-orders')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly orderQueryService: OrderQueryService,
    private readonly adminOrderOperationsService: AdminOrderOperationsService,
  ) {}

  @ApiOperation({
    operationId: 'listAdminOrders',
    summary: 'List admin-visible orders',
  })
  @ApiOkResponse({
    description: 'Returns the admin order monitoring list.',
    type: OrderSummaryDto,
    isArray: true,
  })
  @Get()
  async list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    const orders = await this.orderQueryService.listAdminOrders(currentUser);

    return orders.map((order) => toOrderSummaryDto(order));
  }

  @ApiOperation({
    operationId: 'getAdminOrderDetail',
    summary: 'Get admin order details',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns the full order detail visible to administrators.',
    type: OrderDetailDto,
  })
  @Get(':orderId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.orderQueryService.getAdminOrderDetail(
      currentUser,
      orderId,
    );

    return toOrderDetailDto(order);
  }

  @ApiOperation({
    operationId: 'cancelAdminOrder',
    summary: 'Cancel an order from the admin control plane',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiBody({ type: AdminCancelOrderDto, required: false })
  @ApiOkResponse({
    description:
      'Cancels an eligible order through the administrative control path and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post(':orderId/cancel')
  async cancel(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: AdminCancelOrderDto,
  ) {
    const order = await this.adminOrderOperationsService.cancelAdminOrder(
      currentUser,
      {
        orderId,
        reasonCode: body?.reasonCode,
        note: body?.note,
      },
    );

    return toOrderDetailDto(order);
  }

  @ApiOperation({
    operationId: 'updateAdminOrderStatus',
    summary: 'Override order status as an admin action',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiBody({ type: AdminUpdateOrderStatusDto })
  @ApiOkResponse({
    description:
      'Overrides an order status through the administrative control path and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Patch(':orderId/status')
  async updateStatus(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: AdminUpdateOrderStatusDto,
  ) {
    const order = await this.adminOrderOperationsService.overrideAdminOrderStatus(
      currentUser,
      {
        orderId,
        status: body.status,
        reasonCode: body.reasonCode,
        note: body.note,
      },
    );

    return toOrderDetailDto(order);
  }
}
