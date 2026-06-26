"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const order_detail_entity_1 = require("../../../../src/modules/orders/entities/order-detail.entity");
const order_summary_entity_1 = require("../../../../src/modules/orders/entities/order-summary.entity");
const orders_repository_1 = require("../../../../src/modules/orders/repositories/orders.repository");
function makeRepository() {
    const prisma = {
        order: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return {
        prisma,
        repository: new orders_repository_1.OrdersRepository(prisma),
    };
}
describe('OrdersRepository', () => {
    it('lists recent order summaries using the shared summary include and descending placement order', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findMany.mockResolvedValue([]);
        await repository.findRecentOrderSummaries();
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: 20,
        });
    });
    it('filters customer order summaries by customer profile id', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findMany.mockResolvedValue([]);
        await repository.findCustomerOrderSummaries('cust_prof_1', 10);
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                customerProfileId: 'cust_prof_1',
            },
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: 10,
        });
    });
    it('filters merchant order summaries by merchant ownership through branch relation', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findMany.mockResolvedValue([]);
        await repository.findMerchantOrderSummaries('merchant_1', { limit: 5 });
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                branch: {
                    is: {
                        merchantId: 'merchant_1',
                    },
                },
            },
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: 5,
        });
    });
    it('filters rider order summaries by assigned delivery rider', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findMany.mockResolvedValue([]);
        await repository.findRiderOrderSummaries('rider_1', 5);
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                delivery: {
                    is: {
                        riderId: 'rider_1',
                    },
                },
            },
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: 5,
        });
    });
    it('loads order details with item snapshots and status history', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findUnique.mockResolvedValue(null);
        await repository.findOrderDetailById('order_1');
        expect(prisma.order.findUnique).toHaveBeenCalledWith({
            where: {
                id: 'order_1',
            },
            include: order_detail_entity_1.orderDetailInclude,
        });
    });
    it('loads timeline-only history in chronological order', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.findUnique.mockResolvedValue({
            statusHistory: [],
        });
        await repository.findOrderTimelineById('order_1');
        expect(prisma.order.findUnique).toHaveBeenCalledWith({
            where: {
                id: 'order_1',
            },
            select: {
                statusHistory: {
                    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                    select: order_detail_entity_1.orderTimelineSelect,
                },
            },
        });
    });
    it('updates order status and appends a status history entry using the detail include', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.update.mockResolvedValue({});
        await repository.updateOrderStatus('order_1', {
            status: 'CANCELLED',
            fromStatus: 'PLACED',
            changedByUserId: 'usr_1',
            reasonCode: 'customer_cancelled',
            note: 'Changed my mind',
        });
        expect(prisma.order.update).toHaveBeenCalledWith({
            where: {
                id: 'order_1',
            },
            data: {
                status: 'CANCELLED',
                statusHistory: {
                    create: {
                        fromStatus: 'PLACED',
                        toStatus: 'CANCELLED',
                        changedByUserId: 'usr_1',
                        reasonCode: 'customer_cancelled',
                        note: 'Changed my mind',
                    },
                },
            },
            include: order_detail_entity_1.orderDetailInclude,
        });
    });
    it('keeps checkout order creation behavior intact for nested snapshot persistence', async () => {
        const { prisma, repository } = makeRepository();
        prisma.order.create.mockResolvedValue({});
        await repository.createCheckoutOrder({
            orderCode: 'ORD-00000001',
            customerProfileId: 'cust_prof_1',
            branchId: 'branch_1',
            addressId: 'addr_1',
            cartId: 'cart_1',
            idempotencyKey: 'idem_1',
            status: 'PLACED',
            currencyCode: 'MMK',
            subtotalAmount: new client_1.Prisma.Decimal('6500'),
            discountAmount: new client_1.Prisma.Decimal('0'),
            deliveryFee: new client_1.Prisma.Decimal('500'),
            totalAmount: new client_1.Prisma.Decimal('7000'),
            deliveryLabel: 'Home',
            deliveryLine1: 'No. 1, Main Road',
            deliveryTownship: 'Botahtaung',
            deliveryLatitude: new client_1.Prisma.Decimal('16.834'),
            deliveryLongitude: new client_1.Prisma.Decimal('96.176'),
            changedByUserId: 'usr_1',
            cartItems: [],
        });
        expect(prisma.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                orderCode: 'ORD-00000001',
                customerProfileId: 'cust_prof_1',
                statusHistory: {
                    create: expect.objectContaining({
                        toStatus: 'PLACED',
                        changedByUserId: 'usr_1',
                    }),
                },
            }),
        }));
    });
});
//# sourceMappingURL=orders.repository.spec.js.map