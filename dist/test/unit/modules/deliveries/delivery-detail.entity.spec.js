"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const delivery_detail_entity_1 = require("../../../../src/modules/deliveries/entities/delivery-detail.entity");
function makeDeliveryDetailRecord(overrides) {
    return {
        id: 'delivery_1',
        orderId: 'order_1',
        riderId: 'rider_1',
        status: client_1.DeliveryStatus.ASSIGNED,
        etaMinutes: 18,
        assignedAt: new Date('2026-04-19T11:00:00.000Z'),
        acceptedAt: null,
        pickedUpAt: null,
        onTheWayAt: null,
        deliveredAt: null,
        failedAt: null,
        cancelledAt: null,
        failureReasonCode: null,
        failureNote: null,
        createdAt: new Date('2026-04-19T11:00:00.000Z'),
        updatedAt: new Date('2026-04-19T11:05:00.000Z'),
        order: {
            id: 'order_1',
            orderCode: 'ORD-00000001',
            status: 'RIDER_ASSIGNED',
            currencyCode: 'MMK',
            subtotalAmount: new client_1.Prisma.Decimal('6500'),
            discountAmount: new client_1.Prisma.Decimal('0'),
            deliveryFee: new client_1.Prisma.Decimal('500'),
            totalAmount: new client_1.Prisma.Decimal('7000'),
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
                user: {
                    id: 'usr_customer_1',
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
        },
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
            availability: {
                isOnline: true,
                isAvailable: true,
                lastStatusChangedAt: new Date('2026-04-19T10:55:00.000Z'),
                updatedAt: new Date('2026-04-19T10:55:00.000Z'),
            },
            currentLocation: {
                latitude: new client_1.Prisma.Decimal('16.840'),
                longitude: new client_1.Prisma.Decimal('96.180'),
                heading: new client_1.Prisma.Decimal('90'),
                speed: new client_1.Prisma.Decimal('28'),
                accuracyMeters: new client_1.Prisma.Decimal('6'),
                recordedAt: new Date('2026-04-19T11:04:00.000Z'),
                deliveryId: 'delivery_1',
            },
        },
        ...overrides,
    };
}
describe('buildDeliveryDetail', () => {
    it('serializes delivery, linked order, rider availability, and rider location data', () => {
        const result = (0, delivery_detail_entity_1.buildDeliveryDetail)(makeDeliveryDetailRecord());
        expect(result).toMatchObject({
            deliveryId: 'delivery_1',
            orderId: 'order_1',
            riderId: 'rider_1',
            status: client_1.DeliveryStatus.ASSIGNED,
            order: {
                orderCode: 'ORD-00000001',
                orderStatus: 'RIDER_ASSIGNED',
                totalAmount: '7000',
                deliveryAddress: {
                    township: 'Botahtaung',
                    latitude: '16.834',
                    longitude: '96.176',
                },
            },
            rider: {
                riderId: 'rider_1',
                displayName: 'Ko Aung',
                availability: {
                    isOnline: true,
                    isAvailable: true,
                },
                currentLocation: {
                    latitude: '16.84',
                    longitude: '96.18',
                    deliveryId: 'delivery_1',
                },
            },
        });
    });
    it('keeps nullable rider context when a delivery has not been assigned yet', () => {
        const result = (0, delivery_detail_entity_1.buildDeliveryDetail)(makeDeliveryDetailRecord({
            riderId: null,
            rider: null,
            status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
        }));
        expect(result.rider).toBeNull();
        expect(result.riderId).toBeNull();
        expect(result.status).toBe(client_1.DeliveryStatus.PENDING_ASSIGNMENT);
    });
});
//# sourceMappingURL=delivery-detail.entity.spec.js.map