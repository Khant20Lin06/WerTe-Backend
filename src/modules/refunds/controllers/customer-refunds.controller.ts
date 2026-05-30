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
  RefundDetailDto,
  RefundSummaryDto,
  toRefundDetailDto,
  toRefundSummaryDto,
} from '../dto/refund-summary.dto';
import { RefundsRestService } from '../services/refunds-rest.service';

@ApiTags('customer-refunds')
@ApiBearerAuth('access-token')
@Roles(UserRole.CUSTOMER)
@Controller('customer/orders/:orderId/refunds')
export class CustomerRefundsController {
  constructor(private readonly refundsRestService: RefundsRestService) {}

  @ApiOperation({
    operationId: 'listCustomerOrderRefunds',
    summary: 'List refunds for a customer order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated customer.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns refunds linked to the authenticated customer order.',
    type: RefundSummaryDto,
    isArray: true,
  })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
  ) {
    const refunds = await this.refundsRestService.listCurrentCustomerOrderRefunds(
      currentUser,
      orderId,
    );

    return refunds.map((refund) => toRefundSummaryDto(refund));
  }

  @ApiOperation({
    operationId: 'getCustomerOrderRefundDetail',
    summary: 'Get refund details for a customer order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the authenticated customer.',
    example: 'order_1',
  })
  @ApiParam({
    name: 'refundId',
    description: 'Refund identifier linked to the authenticated customer order.',
    example: 'refund_1',
  })
  @ApiOkResponse({
    description: 'Returns the full refund detail visible to the authenticated customer.',
    type: RefundDetailDto,
  })
  @Get(':refundId')
  async detail(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Param('refundId') refundId: string,
  ) {
    const refund = await this.refundsRestService.getCurrentCustomerOrderRefundDetail(
      currentUser,
      orderId,
      refundId,
    );

    return toRefundDetailDto(refund);
  }
}
