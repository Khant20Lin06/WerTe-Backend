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
  RefundDetailDto,
  RefundSummaryDto,
  toRefundDetailDto,
  toRefundSummaryDto,
} from '../dto/refund-summary.dto';
import { RefundsRestService } from '../services/refunds-rest.service';

@ApiTags('admin-order-refunds')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/orders/:orderId/refunds')
export class AdminOrderRefundsController {
  constructor(private readonly refundsRestService: RefundsRestService) {}

  @ApiOperation({
    operationId: 'listAdminOrderRefunds',
    summary: 'List refunds for an order in the admin control plane',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiOkResponse({
    description: 'Returns refunds linked to the administrative order view.',
    type: RefundSummaryDto,
    isArray: true,
  })
  @Get()
  async list(@Param('orderId') orderId: string) {
    const refunds = await this.refundsRestService.listCurrentAdminOrderRefunds(
      orderId,
    );

    return refunds.map((refund) => toRefundSummaryDto(refund));
  }

  @ApiOperation({
    operationId: 'getAdminOrderRefundDetail',
    summary: 'Get refund detail in the admin control plane',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiParam({
    name: 'refundId',
    description: 'Refund identifier linked to the administrative order view.',
    example: 'refund_1',
  })
  @ApiOkResponse({
    description: 'Returns the full administrative refund detail snapshot.',
    type: RefundDetailDto,
  })
  @Get(':refundId')
  async detail(
    @Param('orderId') orderId: string,
    @Param('refundId') refundId: string,
  ) {
    const refund = await this.refundsRestService.getCurrentAdminOrderRefundDetail(
      orderId,
      refundId,
    );

    return toRefundDetailDto(refund);
  }
}
