"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const delivery_detail_entity_1 = require("../../../../src/modules/deliveries/entities/delivery-detail.entity");
const deliveries_repository_1 = require("../../../../src/modules/deliveries/repositories/deliveries.repository");
function makeRepository() {
    const prisma = {
        delivery: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            upsert: jest.fn(),
        },
    };
    return {
        prisma,
        repository: new deliveries_repository_1.DeliveriesRepository(prisma),
    };
}
describe('DeliveriesRepository', () => {
    it('loads delivery detail by id with the shared include', async () => {
        const { prisma, repository } = makeRepository();
        prisma.delivery.findUnique.mockResolvedValue(null);
        await repository.findById('delivery_1');
        expect(prisma.delivery.findUnique).toHaveBeenCalledWith({
            where: {
                id: 'delivery_1',
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    });
    it('loads delivery detail by order id with the shared include', async () => {
        const { prisma, repository } = makeRepository();
        prisma.delivery.findUnique.mockResolvedValue(null);
        await repository.findByOrderId('order_1');
        expect(prisma.delivery.findUnique).toHaveBeenCalledWith({
            where: {
                orderId: 'order_1',
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    });
    it('loads rider active delivery using fulfillment-active statuses in descending update order', async () => {
        const { prisma, repository } = makeRepository();
        prisma.delivery.findFirst.mockResolvedValue(null);
        await repository.findRiderActiveDelivery('rider_1');
        expect(prisma.delivery.findFirst).toHaveBeenCalledWith({
            where: {
                riderId: 'rider_1',
                status: {
                    in: [
                        client_1.DeliveryStatus.ASSIGNED,
                        client_1.DeliveryStatus.ACCEPTED,
                        client_1.DeliveryStatus.PICKED_UP,
                        client_1.DeliveryStatus.ON_THE_WAY,
                    ],
                },
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        });
    });
    it('upserts rider assignment snapshots for the order delivery record', async () => {
        const { prisma, repository } = makeRepository();
        const upsert = prisma.delivery.upsert;
        upsert.mockResolvedValue({});
        const assignedAt = new Date('2026-04-19T10:10:00.000Z');
        await repository.upsertAssignedDelivery('order_1', {
            riderId: 'rider_1',
            etaMinutes: 18,
            assignedAt,
        });
        expect(upsert).toHaveBeenCalledWith({
            where: {
                orderId: 'order_1',
            },
            create: {
                orderId: 'order_1',
                riderId: 'rider_1',
                status: client_1.DeliveryStatus.ASSIGNED,
                etaMinutes: 18,
                assignedAt,
            },
            update: {
                riderId: 'rider_1',
                status: client_1.DeliveryStatus.ASSIGNED,
                etaMinutes: 18,
                assignedAt,
                acceptedAt: null,
                pickedUpAt: null,
                onTheWayAt: null,
                deliveredAt: null,
                failedAt: null,
                cancelledAt: null,
                failureReasonCode: null,
                failureNote: null,
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    });
});
//# sourceMappingURL=deliveries.repository.spec.js.map