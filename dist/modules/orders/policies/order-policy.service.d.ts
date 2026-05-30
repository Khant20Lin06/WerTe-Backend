import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderSummaryEntity } from '../entities/order-summary.entity';
export declare class OrderPolicyService {
    canViewCustomerOrders(currentUser: AuthenticatedUserEntity): boolean;
    canViewMerchantOrders(currentUser: AuthenticatedUserEntity): boolean;
    canViewRiderOrders(currentUser: AuthenticatedUserEntity): boolean;
    canViewAdminOrders(currentUser: AuthenticatedUserEntity): boolean;
    canViewOrder(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canCancelCustomerOrder(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canMerchantAccept(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canMerchantReject(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canMarkPreparing(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canRiderAcceptAssignment(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canRiderRejectAssignment(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canRiderMarkPickedUp(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canRiderMarkOnTheWay(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canRiderMarkDelivered(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canRiderMarkFailedDelivery(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canAdminOverrideStatus(currentUser: AuthenticatedUserEntity): boolean;
    canAdminAssignRider(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
    canAdminCancelOrder(currentUser: AuthenticatedUserEntity, order: OrderSummaryEntity): boolean;
}
