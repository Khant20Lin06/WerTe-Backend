import { Injectable } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';

import {
  hasRole,
} from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderSummaryEntity } from '../entities/order-summary.entity';
import {
  hasCustomerOrderAccess,
  hasMerchantOrderAccess,
  hasRiderOrderAccess,
} from './order-access-policy.helper';

const CUSTOMER_CANCELLABLE_STATUSES = new Set<OrderStatus>([
  OrderStatus.PLACED,
  OrderStatus.MERCHANT_ACCEPTED,
  OrderStatus.PREPARING,
]);

const ADMIN_CANCELLABLE_STATUSES = new Set<OrderStatus>([
  OrderStatus.PLACED,
  OrderStatus.MERCHANT_ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.RIDER_ASSIGNED,
  OrderStatus.RIDER_ACCEPTED,
  OrderStatus.PICKED_UP,
  OrderStatus.ON_THE_WAY,
]);

const RIDER_FAILABLE_STATUSES = new Set<OrderStatus>([
  OrderStatus.PICKED_UP,
  OrderStatus.ON_THE_WAY,
]);

@Injectable()
export class OrderPolicyService {
  canViewCustomerOrders(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.CUSTOMER);
  }

  canViewMerchantOrders(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.MERCHANT);
  }

  canViewRiderOrders(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.RIDER);
  }

  canViewAdminOrders(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.ADMIN);
  }

  canViewOrder(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      this.canViewAdminOrders(currentUser) ||
      hasCustomerOrderAccess({ currentUser, order }) ||
      hasMerchantOrderAccess({ currentUser, order }) ||
      hasRiderOrderAccess({ currentUser, order })
    );
  }

  canCancelCustomerOrder(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasCustomerOrderAccess({ currentUser, order }) &&
      CUSTOMER_CANCELLABLE_STATUSES.has(order.status)
    );
  }

  canMerchantAccept(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasMerchantOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.PLACED
    );
  }

  canMerchantReject(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasMerchantOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.PLACED
    );
  }

  canMarkPreparing(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasMerchantOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.MERCHANT_ACCEPTED
    );
  }

  canRiderAcceptAssignment(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasRiderOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.RIDER_ASSIGNED
    );
  }

  canRiderRejectAssignment(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasRiderOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.RIDER_ASSIGNED
    );
  }

  canRiderMarkPickedUp(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasRiderOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.RIDER_ACCEPTED
    );
  }

  canRiderMarkOnTheWay(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasRiderOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.PICKED_UP
    );
  }

  canRiderMarkDelivered(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasRiderOrderAccess({ currentUser, order }) &&
      order.status === OrderStatus.ON_THE_WAY
    );
  }

  canRiderMarkFailedDelivery(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      hasRiderOrderAccess({ currentUser, order }) &&
      RIDER_FAILABLE_STATUSES.has(order.status)
    );
  }

  canAdminOverrideStatus(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.ADMIN);
  }

  canAdminAssignRider(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      this.canViewAdminOrders(currentUser) &&
      order.status === OrderStatus.PREPARING
    );
  }

  canAdminCancelOrder(
    currentUser: AuthenticatedUserEntity,
    order: OrderSummaryEntity,
  ): boolean {
    return (
      this.canViewAdminOrders(currentUser) &&
      ADMIN_CANCELLABLE_STATUSES.has(order.status)
    );
  }
}
