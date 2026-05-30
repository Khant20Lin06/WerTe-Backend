import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { DeliveriesRepository } from '../../deliveries/repositories/deliveries.repository';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrderDetailEntity } from '../../orders/entities/order-detail.entity';
import { OrderPolicyService } from '../../orders/policies/order-policy.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { OrderQueryService } from '../../orders/services/order-query.service';
import { RidersService } from '../../riders/services/riders.service';
import { AssignRiderDto } from '../dto/assign-rider.dto';
import { isDispatchEligibleRider } from '../policies/dispatch-assignment-policy.helper';

type AssignRiderInput = {
  orderId: string;
  riderId: string;
  etaMinutes?: number;
  reasonCode?: string;
  note?: string;
};

@Injectable()
export class DispatchAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderQueryService: OrderQueryService,
    private readonly orderPolicyService: OrderPolicyService,
    private readonly deliveriesRepository: DeliveriesRepository,
    private readonly ridersService: RidersService,
    private readonly systemMessageService: SystemMessageService,
  ) {}

  async assignRiderToOrder(
    currentUser: AuthenticatedUserEntity,
    input: AssignRiderInput | (AssignRiderDto & { orderId: string }),
  ): Promise<OrderDetailEntity> {
    this.requireAdminAccess(currentUser);

    const order = await this.ordersRepository.findOrderDetailById(input.orderId);

    if (order === null) {
      throw new AppException('Order was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const orderDetail = this.orderQueryService.buildOrderDetail(order);

    if (
      orderDetail.status === 'RIDER_ASSIGNED' &&
      orderDetail.delivery?.riderId === input.riderId
    ) {
      return this.orderQueryService.attachAvailableActions(
        currentUser,
        orderDetail,
      );
    }

    if (!this.orderPolicyService.canAdminAssignRider(currentUser, orderDetail)) {
      throw new AppException(
        'This order is not ready for rider assignment.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }

    const rider = await this.ridersService.findById(input.riderId);

    if (rider === null) {
      throw new AppException('Rider was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!isDispatchEligibleRider(rider)) {
      throw new AppException(
        'The selected rider is not currently available for assignment.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
        },
      );
    }

    const assignedAt = new Date();
    await this.prisma.runInTransaction(async (tx) => {
      await this.deliveriesRepository.upsertAssignedDelivery(
        input.orderId,
        {
          riderId: rider.id,
          etaMinutes: input.etaMinutes ?? null,
          assignedAt,
        },
        tx,
      );

      await this.ordersRepository.updateOrderStatus(
        input.orderId,
        {
          status: 'RIDER_ASSIGNED',
          fromStatus: order.status,
          changedByUserId: currentUser.userId,
          reasonCode:
            this.normalizeOptionalString(input.reasonCode) ??
            'admin_assigned_rider',
          note: this.normalizeOptionalString(input.note),
        },
        tx,
      );
    });

    const updatedOrder = await this.ordersRepository.findOrderDetailById(
      input.orderId,
    );

    if (updatedOrder === null) {
      throw new AppException(
        'Assigned order detail could not be reloaded.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    await this.systemMessageService.publishOrderEvent(currentUser, {
      orderId: input.orderId,
      code: 'RIDER_ASSIGNED',
      metadata: {
        actorUserId: currentUser.userId,
        riderId: rider.id,
        etaMinutes: input.etaMinutes ?? null,
        reasonCode:
          this.normalizeOptionalString(input.reasonCode) ??
          'admin_assigned_rider',
        note: this.normalizeOptionalString(input.note),
      },
      templateVariables: {
        riderName: rider.displayName,
        reasonCode:
          this.normalizeOptionalString(input.reasonCode) ??
          'admin_assigned_rider',
        note: this.normalizeOptionalString(input.note),
      },
    });

    return this.orderQueryService.attachAvailableActions(
      currentUser,
      this.orderQueryService.buildOrderDetail(updatedOrder),
    );
  }

  private requireAdminAccess(currentUser: AuthenticatedUserEntity): void {
    if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
      throw new AppException(
        'You are not allowed to perform dispatch assignment actions.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }

  private normalizeOptionalString(value: string | undefined | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? null : normalized;
  }
}
