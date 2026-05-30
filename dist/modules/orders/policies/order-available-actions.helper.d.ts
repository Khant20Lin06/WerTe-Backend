import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderSummaryEntity } from '../entities/order-summary.entity';
import { OrderPolicyService } from './order-policy.service';
export declare const OrderAvailableActions: {
    readonly cancel: "cancel";
    readonly merchantAccept: "merchant_accept";
    readonly merchantReject: "merchant_reject";
    readonly markPreparing: "mark_preparing";
    readonly riderAcceptAssignment: "rider_accept_assignment";
    readonly riderRejectAssignment: "rider_reject_assignment";
    readonly riderMarkPickedUp: "rider_mark_picked_up";
    readonly riderMarkOnTheWay: "rider_mark_on_the_way";
    readonly riderMarkDelivered: "rider_mark_delivered";
    readonly riderMarkFailedDelivery: "rider_mark_failed_delivery";
    readonly adminAssignRider: "admin_assign_rider";
    readonly adminCancel: "admin_cancel";
    readonly adminOverrideStatus: "admin_override_status";
};
export type OrderAvailableAction = (typeof OrderAvailableActions)[keyof typeof OrderAvailableActions];
type ComputeOrderAvailableActionsInput = {
    currentUser: AuthenticatedUserEntity;
    order: OrderSummaryEntity;
    orderPolicyService: OrderPolicyService;
};
export declare function computeOrderAvailableActions({ currentUser, order, orderPolicyService, }: ComputeOrderAvailableActionsInput): OrderAvailableAction[];
export {};
