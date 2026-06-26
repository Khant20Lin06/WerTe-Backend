"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dispatch_queue_entry_entity_1 = require("../../../../src/modules/dispatch/entities/dispatch-queue-entry.entity");
const dispatch_repository_1 = require("../../../../src/modules/dispatch/repositories/dispatch.repository");
function makeRepository() {
    const prisma = {
        order: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return {
        prisma,
        repository: new dispatch_repository_1.DispatchRepository(prisma),
    };
}
describe('DispatchRepository', () => {
    it('lists dispatch queue entries from preparing and rider-assigned orders in ascending placement order', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findMany.mockResolvedValue([]);
        await repository.findQueueEntries();
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    {
                        status: client_1.OrderStatus.PREPARING,
                    },
                    {
                        status: client_1.OrderStatus.RIDER_ASSIGNED,
                        delivery: {
                            is: {
                                status: {
                                    in: [client_1.DeliveryStatus.ASSIGNED, client_1.DeliveryStatus.PENDING_ASSIGNMENT],
                                },
                            },
                        },
                    },
                ],
            },
            include: dispatch_queue_entry_entity_1.dispatchQueueOrderInclude,
            orderBy: [{ placedAt: 'asc' }, { id: 'asc' }],
            take: 50,
        });
    });
    it('loads a single queue entry by order id using the shared queue include', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findFirst.mockResolvedValue(null);
        await repository.findQueueEntryByOrderId('order_1');
        expect(prisma.order.findFirst).toHaveBeenCalledWith({
            where: {
                id: 'order_1',
                OR: [
                    {
                        status: client_1.OrderStatus.PREPARING,
                    },
                    {
                        status: client_1.OrderStatus.RIDER_ASSIGNED,
                        delivery: {
                            is: {
                                status: {
                                    in: [client_1.DeliveryStatus.ASSIGNED, client_1.DeliveryStatus.PENDING_ASSIGNMENT],
                                },
                            },
                        },
                    },
                ],
            },
            include: dispatch_queue_entry_entity_1.dispatchQueueOrderInclude,
        });
    });
});
//# sourceMappingURL=dispatch.repository.spec.js.map