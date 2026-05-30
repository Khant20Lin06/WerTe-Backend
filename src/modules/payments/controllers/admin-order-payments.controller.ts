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
import {
  PaymentDetailDto,
  PaymentSummaryDto,
  toPaymentDetailDto,
  toPaymentSummaryDto,
} from '../dto/payment-summary.dto';
import { PaymentsRestService } from '../services/payments-rest.service';

@ApiTags('admin-order-payments')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/orders/:orderId/payments')
export class AdminOrderPaymentsController {
  constructor(private readonly paymentsRestService: PaymentsRestService) {}

  @ApiOperation({
    operationId: 'listAdminOrderPayments',
    summary: 'List payments for an order in the admin control plane',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns payments linked to the administrative order view.',
    type: PaymentSummaryDto,
    isArray: true,
  })
  @Get()
  async list(@Param('orderId') orderId: string) {
    const payments =
      await this.paymentsRestService.listCurrentAdminOrderPayments(orderId);

    return payments.map((payment) => toPaymentSummaryDto(payment));
  }

  @ApiOperation({
    operationId: 'getAdminOrderPaymentDetail',
    summary: 'Get payment detail in the admin control plane',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment identifier linked to the administrative order view.',
    example: 'payment_1',
  })
  @ApiOkResponse({
    description: 'Returns the full administrative payment detail snapshot.',
    type: PaymentDetailDto,
  })
  @Get(':paymentId')
  async detail(
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
  ) {
    const payment = await this.paymentsRestService.getCurrentAdminOrderPaymentDetail(
      orderId,
      paymentId,
    );

    return toPaymentDetailDto(payment);
  }
}
