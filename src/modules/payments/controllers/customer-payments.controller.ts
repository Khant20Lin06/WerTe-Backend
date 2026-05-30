import { Controller, Get, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  PaymentDetailDto,
  PaymentSummaryDto,
  toPaymentDetailDto,
  toPaymentSummaryDto,
} from '../dto/payment-summary.dto';
import { PaymentsRestService } from '../services/payments-rest.service';

@ApiTags('customer-payments')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/orders/:orderId/payments')
export class CustomerPaymentsController {
  constructor(private readonly paymentsRestService: PaymentsRestService) {}

  @ApiOperation({
    operationId: 'listCustomerOrderPayments',
    summary: 'List payments for a customer order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated customer.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns payments linked to the authenticated customer order.',
    type: PaymentSummaryDto,
    isArray: true,
  })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
  ) {
    const payments =
      await this.paymentsRestService.listCurrentCustomerOrderPayments(
        currentUser,
        orderId,
      );

    return payments.map((payment) => toPaymentSummaryDto(payment));
  }

  @ApiOperation({
    operationId: 'getCustomerOrderPaymentDetail',
    summary: 'Get payment details for a customer order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated customer.',
    example: 'order_1',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment identifier linked to the authenticated customer order.',
    example: 'payment_1',
  })
  @ApiOkResponse({
    description: 'Returns the full payment detail visible to the authenticated customer.',
    type: PaymentDetailDto,
  })
  @Get(':paymentId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
  ) {
    const payment =
      await this.paymentsRestService.getCurrentCustomerOrderPaymentDetail(
        currentUser,
        orderId,
        paymentId,
      );

    return toPaymentDetailDto(payment);
  }
}
