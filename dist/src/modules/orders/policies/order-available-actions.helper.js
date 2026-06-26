"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAvailableActions = void 0;
exports.computeOrderAvailableActions = computeOrderAvailableActions;
exports.OrderAvailableActions = {
    cancel: 'cancel',
    merchantAccept: 'merchant_accept',
    merchantReject: 'merchant_reject',
    markPreparing: 'mark_preparing',
    markReady: 'mark_ready',
    merchantConfirmPickup: 'merchant_confirm_pickup',
    riderAcceptAssignment: 'rider_accept_assignment',
    riderRejectAssignment: 'rider_reject_assignment',
    riderMarkPickedUp: 'rider_mark_picked_up',
    riderMarkOnTheWay: 'rider_mark_on_the_way',
    riderMarkDelivered: 'rider_mark_delivered',
    riderMarkFailedDelivery: 'rider_mark_failed_delivery',
    adminAssignRider: 'admin_assign_rider',
    adminCancel: 'admin_cancel',
    adminOverrideStatus: 'admin_override_status',
};
function computeOrderAvailableActions({ currentUser, order, orderPolicyService, }) {
    const actions = [];
    if (orderPolicyService.canCancelCustomerOrder(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.cancel);
    }
    if (orderPolicyService.canMerchantAccept(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.merchantAccept);
    }
    if (orderPolicyService.canMerchantReject(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.merchantReject);
    }
    if (orderPolicyService.canMarkPreparing(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.markPreparing);
    }
    if (orderPolicyService.canMarkReady(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.markReady);
    }
    if (orderPolicyService.canMerchantConfirmPickup(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.merchantConfirmPickup);
    }
    if (orderPolicyService.canRiderAcceptAssignment(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.riderAcceptAssignment);
    }
    if (orderPolicyService.canRiderRejectAssignment(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.riderRejectAssignment);
    }
    if (orderPolicyService.canRiderMarkPickedUp(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.riderMarkPickedUp);
    }
    if (orderPolicyService.canRiderMarkOnTheWay(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.riderMarkOnTheWay);
    }
    if (orderPolicyService.canRiderMarkDelivered(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.riderMarkDelivered);
    }
    if (orderPolicyService.canRiderMarkFailedDelivery(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.riderMarkFailedDelivery);
    }
    if (orderPolicyService.canAdminAssignRider(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.adminAssignRider);
    }
    if (orderPolicyService.canAdminCancelOrder(currentUser, order)) {
        actions.push(exports.OrderAvailableActions.adminCancel);
    }
    if (orderPolicyService.canAdminOverrideStatus(currentUser)) {
        actions.push(exports.OrderAvailableActions.adminOverrideStatus);
    }
    return actions;
}
//# sourceMappingURL=order-available-actions.helper.js.map