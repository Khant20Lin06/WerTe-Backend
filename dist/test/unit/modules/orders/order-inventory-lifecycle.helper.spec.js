"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const order_inventory_lifecycle_helper_1 = require("../../../../src/modules/orders/policies/order-inventory-lifecycle.helper");
describe('order-inventory-lifecycle.helper', () => {
    it('releases inventory for early cancellations', () => {
        expect((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(client_1.OrderStatus.PLACED, client_1.OrderStatus.CANCELLED)).toBe(true);
        expect((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(client_1.OrderStatus.MERCHANT_ACCEPTED, client_1.OrderStatus.CANCELLED)).toBe(true);
    });
    it('releases inventory for merchant rejection before preparation', () => {
        expect((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(client_1.OrderStatus.PLACED, client_1.OrderStatus.MERCHANT_REJECTED)).toBe(true);
    });
    it('does not release inventory for late or non-terminal transitions', () => {
        expect((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(client_1.OrderStatus.PREPARING, client_1.OrderStatus.CANCELLED)).toBe(false);
        expect((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(client_1.OrderStatus.PICKED_UP, client_1.OrderStatus.CANCELLED)).toBe(false);
        expect((0, order_inventory_lifecycle_helper_1.shouldReleaseInventoryForOrderTransition)(client_1.OrderStatus.MERCHANT_ACCEPTED, client_1.OrderStatus.PREPARING)).toBe(false);
    });
});
//# sourceMappingURL=order-inventory-lifecycle.helper.spec.js.map