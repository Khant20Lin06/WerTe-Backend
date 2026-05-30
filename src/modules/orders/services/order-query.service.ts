import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  buildOrderDetail,
  buildOrderTimelineEntry,
  OrderDetailEntity,
  OrderDetailRecord,
  OrderTimelineEntryEntity,
  OrderTimelineEntryRecord,
} from '../entities/order-detail.entity';
import {
  buildOrderSummary,
  OrderSummaryEntity,
  OrderSummaryRecord,
} from '../entities/order-summary.entity';
import { computeOrderAvailableActions } from '../policies/order-available-actions.helper';
import { OrderPolicyService } from '../policies/order-policy.service';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class OrderQueryService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly orderPolicyService: OrderPolicyService,
  ) {}

  async listRecentOrders(): Promise<OrderSummaryEntity[]> {
    const orders = await this.ordersRepository.findRecentOrderSummaries();

    return orders.map((order) => this.buildOrderSummary(order));
  }

  async listCustomerOrders(
    currentUser: AuthenticatedUserEntity,
  ): Promise<OrderSummaryEntity[]> {
    const customerProfileId = this.requireCustomerProfileId(currentUser);
    const orders =
      await this.ordersRepository.findCustomerOrderSummaries(customerProfileId);

    return orders.map((order) =>
      this.attachAvailableActions(currentUser, this.buildOrderSummary(order)),
    );
  }

  async getCustomerOrderDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<OrderDetailEntity> {
    const customerProfileId = this.requireCustomerProfileId(currentUser);
    const order = await this.ordersRepository.findCustomerOrderDetail(
      orderId,
      customerProfileId,
    );

    return this.mapRequiredOrderDetail(currentUser, orderId, order);
  }

  async listMerchantOrders(
    currentUser: AuthenticatedUserEntity,
  ): Promise<OrderSummaryEntity[]> {
    const merchantId = this.requireMerchantId(currentUser);
    const orders = await this.ordersRepository.findMerchantOrderSummaries(
      merchantId,
    );

    return orders.map((order) =>
      this.attachAvailableActions(currentUser, this.buildOrderSummary(order)),
    );
  }

  async getMerchantOrderDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<OrderDetailEntity> {
    const merchantId = this.requireMerchantId(currentUser);
    const order = await this.ordersRepository.findMerchantOrderDetail(
      orderId,
      merchantId,
    );

    return this.mapRequiredOrderDetail(currentUser, orderId, order);
  }

  async listRiderOrders(
    currentUser: AuthenticatedUserEntity,
  ): Promise<OrderSummaryEntity[]> {
    const riderId = this.requireRiderId(currentUser);
    const orders = await this.ordersRepository.findRiderOrderSummaries(riderId);

    return orders.map((order) =>
      this.attachAvailableActions(currentUser, this.buildOrderSummary(order)),
    );
  }

  async getRiderOrderDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<OrderDetailEntity> {
    const riderId = this.requireRiderId(currentUser);
    const order = await this.ordersRepository.findRiderOrderDetail(
      orderId,
      riderId,
    );

    return this.mapRequiredOrderDetail(currentUser, orderId, order);
  }

  async listAdminOrders(
    currentUser: AuthenticatedUserEntity,
  ): Promise<OrderSummaryEntity[]> {
    if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
      throw this.buildForbidden('You are not allowed to view admin order data.');
    }

    const orders = await this.ordersRepository.findRecentOrderSummaries();

    return orders.map((order) =>
      this.attachAvailableActions(currentUser, this.buildOrderSummary(order)),
    );
  }

  async getAdminOrderDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
  ): Promise<OrderDetailEntity> {
    if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
      throw this.buildForbidden('You are not allowed to view admin order data.');
    }

    const order = await this.ordersRepository.findOrderDetailById(orderId);

    return this.mapRequiredOrderDetail(currentUser, orderId, order);
  }

  buildOrderSummary(order: OrderSummaryRecord): OrderSummaryEntity {
    return buildOrderSummary(order);
  }

  buildOrderDetail(order: OrderDetailRecord): OrderDetailEntity {
    return buildOrderDetail(order);
  }

  buildOrderTimelineEntry(
    timelineEntry: OrderTimelineEntryRecord,
  ): OrderTimelineEntryEntity {
    return buildOrderTimelineEntry(timelineEntry);
  }

  private mapRequiredOrderDetail(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    order: OrderDetailRecord | null,
  ): OrderDetailEntity {
    if (order === null) {
      throw new AppException('Order was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    return this.attachAvailableActions(currentUser, this.buildOrderDetail(order));
  }

  attachAvailableActions<T extends OrderSummaryEntity>(
    currentUser: AuthenticatedUserEntity,
    order: T,
  ): T {
    return {
      ...order,
      availableActions: computeOrderAvailableActions({
        currentUser,
        order,
        orderPolicyService: this.orderPolicyService,
      }),
    };
  }

  private requireCustomerProfileId(
    currentUser: AuthenticatedUserEntity,
  ): string {
    const customerProfileId = currentUser.actorContext.customerProfileId;

    if (customerProfileId === undefined) {
      throw this.buildForbidden(
        'The authenticated actor does not have a customer profile scope.',
      );
    }

    return customerProfileId;
  }

  private requireMerchantId(currentUser: AuthenticatedUserEntity): string {
    const merchantId = currentUser.actorContext.merchantId;

    if (merchantId === undefined) {
      throw this.buildForbidden(
        'The authenticated actor does not have a merchant scope.',
      );
    }

    return merchantId;
  }

  private requireRiderId(currentUser: AuthenticatedUserEntity): string {
    const riderId = currentUser.actorContext.riderId;

    if (riderId === undefined) {
      throw this.buildForbidden(
        'The authenticated actor does not have a rider scope.',
      );
    }

    return riderId;
  }

  private buildForbidden(message: string): AppException {
    return new AppException(message, HttpStatus.FORBIDDEN, {
      code: ErrorCodes.forbidden,
    });
  }
}
