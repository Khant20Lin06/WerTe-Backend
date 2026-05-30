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
import { AdminFinalizeRefundDto } from '../dto/admin-finalize-refund.dto';
import { AdminRequestRefundDto } from '../dto/admin-request-refund.dto';
import { RefundSummaryDto, toRefundSummaryDto } from '../dto/refund-summary.dto';
import { RefundsRestService } from '../services/refunds-rest.service';

@ApiTags('admin-refunds')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminRefundsController {
  constructor(private readonly refundsRestService: RefundsRestService) {}

  @ApiOperation({
    operationId: 'requestAdminRefund',
    summary: 'Request a refund for a payment from the admin control plane',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment identifier visible to the administrative control plane.',
    example: 'payment_1',
  })
  @ApiBody({ type: AdminRequestRefundDto })
  @ApiOkResponse({
    description: 'Creates a refund request and returns the refund snapshot.',
    type: RefundSummaryDto,
  })
  @Post('payments/:paymentId/refunds')
  async request(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('paymentId') paymentId: string,
    @Body() body: AdminRequestRefundDto,
  ) {
    const refund = await this.refundsRestService.requestCurrentAdminRefund(
      currentUser,
      paymentId,
      {
        amount: body.amount,
        idempotencyKey: body?.idempotencyKey,
        providerReference: body?.providerReference,
        reasonCode: body?.reasonCode,
        note: body?.note,
      },
    );

    return toRefundSummaryDto(refund);
  }

  @ApiOperation({
    operationId: 'succeedAdminRefund',
    summary: 'Mark a refund as succeeded from the admin control plane',
  })
  @ApiParam({
    name: 'refundId',
    description: 'Refund identifier visible to the administrative control plane.',
    example: 'refund_1',
  })
  @ApiBody({ type: AdminFinalizeRefundDto, required: false })
  @ApiOkResponse({
    description: 'Marks the refund as succeeded and returns the updated refund snapshot.',
    type: RefundSummaryDto,
  })
  @Post('refunds/:refundId/succeed')
  async succeed(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('refundId') refundId: string,
    @Body() body: AdminFinalizeRefundDto,
  ) {
    const refund = await this.refundsRestService.succeedCurrentAdminRefund(
      currentUser,
      refundId,
      {
        providerReference: body?.providerReference,
        reasonCode: body?.reasonCode,
        failureCode: body?.failureCode,
        failureMessage: body?.failureMessage,
        note: body?.note,
      },
    );

    return toRefundSummaryDto(refund);
  }

  @ApiOperation({
    operationId: 'failAdminRefund',
    summary: 'Mark a refund as failed from the admin control plane',
  })
  @ApiParam({
    name: 'refundId',
    description: 'Refund identifier visible to the administrative control plane.',
    example: 'refund_1',
  })
  @ApiBody({ type: AdminFinalizeRefundDto, required: false })
  @ApiOkResponse({
    description: 'Marks the refund as failed and returns the updated refund snapshot.',
    type: RefundSummaryDto,
  })
  @Post('refunds/:refundId/fail')
  async fail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('refundId') refundId: string,
    @Body() body: AdminFinalizeRefundDto,
  ) {
    const refund = await this.refundsRestService.failCurrentAdminRefund(
      currentUser,
      refundId,
      {
        providerReference: body?.providerReference,
        reasonCode: body?.reasonCode,
        failureCode: body?.failureCode,
        failureMessage: body?.failureMessage,
        note: body?.note,
      },
    );

    return toRefundSummaryDto(refund);
  }
}
