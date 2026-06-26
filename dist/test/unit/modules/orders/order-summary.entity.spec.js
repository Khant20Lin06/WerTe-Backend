"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const order_summary_entity_1 = require("../../../../src/modules/orders/entities/order-summary.entity");
function makeOrderSummaryRecord(overrides) {
    return {
        id: 'order_1',
        orderCode: 'ORD-00000001',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        addressId: 'addr_1',
        cartId: 'cart_1',
        idempotencyKey: 'idem_1',
        status: client_1.OrderStatus.PLACED,
        subtotalAmount: new client_1.Prisma.Decimal('6500'),
        discountAmount: new client_1.Prisma.Decimal('0'),
        deliveryFee: new client_1.Prisma.Decimal('500'),
        totalAmount: new client_1.Prisma.Decimal('7000'),
        currencyCode: 'MMK',
        deliveryLabel: 'Home',
        deliveryLine1: 'No. 1, Main Road',
        deliveryLine2: null,
        deliveryLandmark: null,
        deliveryTownship: 'Botahtaung',
        deliveryCity: 'Yangon',
        deliveryPostalCode: null,
        deliveryInstructions: 'Call before arrival',
        deliveryLatitude: new client_1.Prisma.Decimal('16.834'),
        deliveryLongitude: new client_1.Prisma.Decimal('96.176'),
        placedAt: new Date('2026-04-19T10:00:00.000Z'),
        updatedAt: new Date('2026-04-19T10:05:00.000Z'),
        customerProfile: {
            id: 'cust_prof_1',
            fullName: 'Mg Mg',
            avatarUrl: null,
            user: {
                id: 'usr_1',
                phone: '09123456789',
                status: client_1.UserStatus.ACTIVE,
            },
        },
        branch: {
            id: 'branch_1',
            name: 'Downtown Branch',
            status: client_1.BranchStatus.ACTIVE,
            township: 'Botahtaung',
            merchant: {
                id: 'merchant_1',
                userId: 'usr_merchant_1',
                name: 'Merchant One',
                status: client_1.MerchantStatus.ACTIVE,
            },
        },
        delivery: {
            id: 'delivery_1',
            riderId: 'rider_1',
            etaMinutes: 20,
            rider: {
                id: 'rider_1',
                userId: 'usr_rider_1',
                displayName: 'Ko Aung',
                vehicleType: 'bike',
                currentTownship: 'Pabedan',
                status: client_1.RiderStatus.ACTIVE,
                user: {
                    id: 'usr_rider_1',
                    phone: '0999999999',
                    status: client_1.UserStatus.ACTIVE,
                },
            },
        },
        items: [],
        statusHistory: [],
        address: null,
        cart: null,
        conversations: [],
        ...overrides,
    };
}
describe('buildOrderSummary', () => {
    it('serializes order summary scalars and nested context to API-friendly strings', () => {
        const result = (0, order_summary_entity_1.buildOrderSummary)(makeOrderSummaryRecord());
        expect(result).toMatchObject({
            orderId: 'order_1',
            orderCode: 'ORD-00000001',
            subtotalAmount: '6500',
            discountAmount: '0',
            deliveryFee: '500',
            totalAmount: '7000',
            customer: {
                customerProfileId: 'cust_prof_1',
                userId: 'usr_1',
                phone: '09123456789',
                fullName: 'Mg Mg',
            },
            branch: {
                branchId: 'branch_1',
                merchantId: 'merchant_1',
                merchantUserId: 'usr_merchant_1',
                merchantName: 'Merchant One',
            },
            delivery: {
                deliveryId: 'delivery_1',
                riderId: 'rider_1',
                rider: {
                    riderId: 'rider_1',
                    displayName: 'Ko Aung',
                    vehicleType: 'bike',
                },
            },
        });
        expect(result.placedAt).toBe('2026-04-19T10:00:00.000Z');
        expect(result.updatedAt).toBe('2026-04-19T10:05:00.000Z');
    });
    it('keeps delivery context nullable when no delivery has been created yet', () => {
        const result = (0, order_summary_entity_1.buildOrderSummary)(makeOrderSummaryRecord({
            delivery: null,
        }));
        expect(result.delivery).toBeNull();
    });
});
//# sourceMappingURL=order-summary.entity.spec.js.map