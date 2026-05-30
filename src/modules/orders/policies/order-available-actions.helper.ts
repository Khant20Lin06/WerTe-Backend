import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderSummaryEntity } from '../entities/order-summary.entity';
import { OrderPolicyService } from './order-policy.service';

export const OrderAvailableActions = {
  cancel: 'cancel',
  merchantAccept: 'merchant_accept',
  merchantReject: 'merchant_reject',
  markPreparing: 'mark_preparing',
  riderAcceptAssignment: 'rider_accept_assignment',
  riderRejectAssignment: 'rider_reject_assignment',
  riderMarkPickedUp: 'rider_mark_picked_up',
  riderMarkOnTheWay: 'rider_mark_on_the_way',
  riderMarkDelivered: 'rider_mark_delivered',
  riderMarkFailedDelivery: 'rider_mark_failed_delivery',
  adminAssignRider: 'admin_assign_rider',
  adminCancel: 'admin_cancel',
  adminOverrideStatus: 'admin_override_status',
} as const;

export type OrderAvailableAction =
  (typeof OrderAvailableActions)[keyof typeof OrderAvailableActions];

type ComputeOrderAvailableActionsInput = {
  currentUser: AuthenticatedUserEntity;
  order: OrderSummaryEntity;
  orderPolicyService: OrderPolicyService;
};

export function computeOrderAvailableActions({
  currentUser,
  order,
  orderPolicyService,
}: ComputeOrderAvailableActionsInput): OrderAvailableAction[] {
  const actions: OrderAvailableAction[] = [];

  if (orderPolicyService.canCancelCustomerOrder(currentUser, order)) {
    actions.push(OrderAvailableActions.cancel);
  }

  if (orderPolicyService.canMerchantAccept(currentUser, order)) {
    actions.push(OrderAvailableActions.merchantAccept);
  }

  if (orderPolicyService.canMerchantReject(currentUser, order)) {
    actions.push(OrderAvailableActions.merchantReject);
  }

  if (orderPolicyService.canMarkPreparing(currentUser, order)) {
    actions.push(OrderAvailableActions.markPreparing);
  }

  if (orderPolicyService.canRiderAcceptAssignment(currentUser, order)) {
    actions.push(OrderAvailableActions.riderAcceptAssignment);
  }

  if (orderPolicyService.canRiderRejectAssignment(currentUser, order)) {
    actions.push(OrderAvailableActions.riderRejectAssignment);
  }

  if (orderPolicyService.canRiderMarkPickedUp(currentUser, order)) {
    actions.push(OrderAvailableActions.riderMarkPickedUp);
  }

  if (orderPolicyService.canRiderMarkOnTheWay(currentUser, order)) {
    actions.push(OrderAvailableActions.riderMarkOnTheWay);
  }

  if (orderPolicyService.canRiderMarkDelivered(currentUser, order)) {
    actions.push(OrderAvailableActions.riderMarkDelivered);
  }

  if (orderPolicyService.canRiderMarkFailedDelivery(currentUser, order)) {
    actions.push(OrderAvailableActions.riderMarkFailedDelivery);
  }

  if (orderPolicyService.canAdminAssignRider(currentUser, order)) {
    actions.push(OrderAvailableActions.adminAssignRider);
  }

  if (orderPolicyService.canAdminCancelOrder(currentUser, order)) {
    actions.push(OrderAvailableActions.adminCancel);
  }

  if (orderPolicyService.canAdminOverrideStatus(currentUser)) {
    actions.push(OrderAvailableActions.adminOverrideStatus);
  }

  return actions;
}
