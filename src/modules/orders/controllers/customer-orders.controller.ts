import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutSubmissionDto, toCheckoutSubmissionDto } from '../../checkout/dto/checkout-submission.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderDetailDto, toOrderDetailDto } from '../dto/order-detail.dto';
import { OrderSummaryDto, toOrderSummaryDto } from '../dto/order-summary.dto';
import { OrderCancellationService } from '../services/order-cancellation.service';
import { OrderCreationService } from '../services/order-creation.service';
import { OrderQueryService } from '../services/order-query.service';

@ApiTags('customer-orders')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/orders')
export class CustomerOrdersController {
  constructor(
    private readonly orderCreationService: OrderCreationService,
    private readonly orderQueryService: OrderQueryService,
    private readonly orderCancellationService: OrderCancellationService,
  ) {}

  @ApiOperation({
    operationId: 'listCustomerOrders',
    summary: 'List customer orders',
  })
  @ApiOkResponse({
    description: 'Returns recent orders visible to the authenticated customer.',
    type: OrderSummaryDto,
    isArray: true,
  })
  @Get()
  async list(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    const orders = await this.orderQueryService.listCustomerOrders(currentUser);

    return orders.map((order) => toOrderSummaryDto(order));
  }

  @ApiOperation({
    operationId: 'getCustomerOrderDetail',
    summary: 'Get customer order details',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated customer.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns the full order detail visible to the authenticated customer.',
    type: OrderDetailDto,
  })
  @Get(':orderId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.orderQueryService.getCustomerOrderDetail(
      currentUser,
      orderId,
    );

    return toOrderDetailDto(order);
  }

  @ApiOperation({
    operationId: 'createCustomerOrder',
    summary: 'Create a customer order',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description:
      'Submits the validated customer checkout and returns the created order snapshot.',
    type: CheckoutSubmissionDto,
  })
  @Post()
  async create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: CreateOrderDto,
  ) {
    const submission = await this.orderCreationService.create(currentUser, body);

    return toCheckoutSubmissionDto(submission);
  }

  @ApiOperation({
    operationId: 'cancelCustomerOrder',
    summary: 'Cancel a customer order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated customer.',
    example: 'order_1',
  })
  @ApiBody({ type: CancelOrderDto, required: false })
  @ApiOkResponse({
    description:
      'Cancels an eligible customer order and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post(':orderId/cancel')
  async cancel(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: CancelOrderDto,
  ) {
    const order = await this.orderCancellationService.cancelCurrentCustomerOrder(
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
