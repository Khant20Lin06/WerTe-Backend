import { Body, Controller, Param, Post } from '@nestjs/common';
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
import { AdminCancelPaymentDto } from '../dto/admin-cancel-payment.dto';
import { AdminConfirmPaymentDto } from '../dto/admin-confirm-payment.dto';
import { AdminFailPaymentDto } from '../dto/admin-fail-payment.dto';
import { PaymentSummaryDto, toPaymentSummaryDto } from '../dto/payment-summary.dto';
import { PaymentsRestService } from '../services/payments-rest.service';

@ApiTags('admin-payments')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly paymentsRestService: PaymentsRestService) {}

  @ApiOperation({
    operationId: 'confirmAdminPayment',
    summary: 'Confirm a payment from the admin control plane',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment identifier visible to the administrative control plane.',
    example: 'payment_1',
  })
  @ApiBody({ type: AdminConfirmPaymentDto, required: false })
  @ApiOkResponse({
    description: 'Confirms the payment and returns the updated payment snapshot.',
    type: PaymentSummaryDto,
  })
  @Post(':paymentId/confirm')
  async confirm(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('paymentId') paymentId: string,
    @Body() body: AdminConfirmPaymentDto,
  ) {
    const payment = await this.paymentsRestService.confirmCurrentAdminPayment(
      currentUser,
      paymentId,
      {
        providerReference: body?.providerReference,
        providerReceiptId: body?.providerReceiptId,
        reasonCode: body?.reasonCode,
        note: body?.note,
      },
    );

    return toPaymentSummaryDto(payment);
  }

  @ApiOperation({
    operationId: 'failAdminPayment',
    summary: 'Mark a payment as failed from the admin control plane',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment identifier visible to the administrative control plane.',
    example: 'payment_1',
  })
  @ApiBody({ type: AdminFailPaymentDto, required: false })
  @ApiOkResponse({
    description: 'Marks the payment as failed and returns the updated payment snapshot.',
    type: PaymentSummaryDto,
  })
  @Post(':paymentId/fail')
  async fail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('paymentId') paymentId: string,
    @Body() body: AdminFailPaymentDto,
  ) {
    const payment = await this.paymentsRestService.failCurrentAdminPayment(
      currentUser,
      paymentId,
      {
        providerReference: body?.providerReference,
        reasonCode: body?.reasonCode,
        failureCode: body?.failureCode,
        failureMessage: body?.failureMessage,
        note: body?.note,
      },
    );

    return toPaymentSummaryDto(payment);
  }

  @ApiOperation({
    operationId: 'cancelAdminPayment',
    summary: 'Cancel a payment from the admin control plane',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment identifier visible to the administrative control plane.',
    example: 'payment_1',
  })
  @ApiBody({ type: AdminCancelPaymentDto, required: false })
  @ApiOkResponse({
    description: 'Cancels the payment and returns the updated payment snapshot.',
    type: PaymentSummaryDto,
  })
  @Post(':paymentId/cancel')
  async cancel(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('paymentId') paymentId: string,
    @Body() body: AdminCancelPaymentDto,
  ) {
    const payment = await this.paymentsRestService.cancelCurrentAdminPayment(
      currentUser,
      paymentId,
      {
        providerReference: body?.providerReference,
        reasonCode: body?.reasonCode,
        note: body?.note,
      },
    );

    return toPaymentSummaryDto(payment);
  }
}
