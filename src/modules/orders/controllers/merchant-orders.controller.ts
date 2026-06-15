import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOrderActionDto } from '../dto/merchant-order-action.dto';
import { OrderDetailDto, toOrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto, toOrderSummaryDto } from '../dto/order-summary.dto';
import { MerchantOrderHandlingService } from '../services/merchant-order-handling.service';
import { OrderQueryService } from '../services/order-query.service';

@ApiTags('merchant-orders')
@ApiBearerAuth('access-token')
@Roles(UserRole.MERCHANT)
@Controller('merchant/orders')
export class MerchantOrdersController {
  constructor(
    private readonly orderQueryService: OrderQueryService,
    private readonly merchantOrderHandlingService: MerchantOrderHandlingService,
  ) {}

  @ApiOperation({
    operationId: 'listMerchantOrders',
    summary: 'List merchant orders',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter orders by branch. Omit to return orders for all branches.',
    example: 'branch_1',
  })
  @ApiOkResponse({
    description: 'Returns orders visible to the authenticated merchant scope.',
    type: OrderSummaryDto,
    isArray: true,
  })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query('branchId') branchId?: string,
  ) {
    const orders = await this.orderQueryService.listMerchantOrders(currentUser, {
      branchId,
    });

    return orders.map((order) => toOrderSummaryDto(order));
  }

  @ApiOperation({
    operationId: 'getMerchantOrderDetail',
    summary: 'Get merchant order details',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated merchant scope.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns the full order detail visible to the authenticated merchant scope.',
    type: OrderDetailDto,
  })
  @Get(':orderId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.orderQueryService.getMerchantOrderDetail(
      currentUser,
      orderId,
    );

    return toOrderDetailDto(order);
  }

  @ApiOperation({
    operationId: 'acceptMerchantOrder',
    summary: 'Accept a merchant order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated merchant scope.',
    example: 'order_1',
  })
  @ApiBody({ type: MerchantOrderActionDto, required: false })
  @ApiOkResponse({
    description:
      'Accepts an eligible merchant order and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post(':orderId/accept')
  async accept(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: MerchantOrderActionDto,
  ) {
    const order = await this.merchantOrderHandlingService.acceptCurrentMerchantOrder(
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
    operationId: 'rejectMerchantOrder',
    summary: 'Reject a merchant order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated merchant scope.',
    example: 'order_1',
  })
  @ApiBody({ type: MerchantOrderActionDto, required: false })
  @ApiOkResponse({
    description:
      'Rejects an eligible merchant order and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post(':orderId/reject')
  async reject(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: MerchantOrderActionDto,
  ) {
    const order = await this.merchantOrderHandlingService.rejectCurrentMerchantOrder(
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
    operationId: 'markMerchantOrderPreparing',
    summary: 'Mark a merchant order as preparing',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated merchant scope.',
    example: 'order_1',
  })
  @ApiBody({ type: MerchantOrderActionDto, required: false })
  @ApiOkResponse({
    description:
      'Marks an accepted merchant order as preparing and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post(':orderId/preparing')
  async markPreparing(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: MerchantOrderActionDto,
  ) {
    const order =
      await this.merchantOrderHandlingService.markPreparingCurrentMerchantOrder(
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
    operationId: 'markMerchantOrderReady',
    summary: 'Mark a merchant order as ready for pickup',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated merchant scope.',
    example: 'order_1',
  })
  @ApiBody({ type: MerchantOrderActionDto, required: false })
  @ApiOkResponse({
    description:
      'Marks a preparing merchant order as ready for rider pickup and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post(':orderId/ready')
  async markReady(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: MerchantOrderActionDto,
  ) {
    const order =
      await this.merchantOrderHandlingService.markReadyCurrentMerchantOrder(
        currentUser,
        {
          orderId,
          reasonCode: body?.reasonCode,
          note: body?.note,
        },
      );

    return toOrderDetailDto(order);
  }
}
