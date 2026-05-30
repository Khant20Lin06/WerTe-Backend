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
import { OrderDetailDto, toOrderDetailDto } from '../../orders/dto/order-detail.dto';
import { AssignRiderDto } from '../dto/assign-rider.dto';
import { DispatchAssignmentService } from '../services/dispatch-assignment.service';

@ApiTags('admin-dispatch')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/dispatch')
export class AdminDispatchController {
  constructor(
    private readonly dispatchAssignmentService: DispatchAssignmentService,
  ) {}

  @ApiOperation({
    operationId: 'assignRiderToOrder',
    summary: 'Assign a rider to an order from the admin dispatch control plane',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order identifier visible to the administrative control plane.',
    example: 'order_1',
  })
  @ApiBody({ type: AssignRiderDto })
  @ApiOkResponse({
    description:
      'Assigns a rider to an eligible order and returns the updated order detail snapshot.',
    type: OrderDetailDto,
  })
  @Post('orders/:orderId/assign-rider')
  async assignRider(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: AssignRiderDto,
  ) {
    const order = await this.dispatchAssignmentService.assignRiderToOrder(
      currentUser,
      {
        orderId,
        riderId: body.riderId,
        etaMinutes: body.etaMinutes,
        reasonCode: body.reasonCode,
        note: body.note,
      },
    );

    return toOrderDetailDto(order);
  }
}
