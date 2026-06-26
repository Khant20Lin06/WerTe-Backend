"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const menu_inventory_lifecycle_service_1 = require("../../../../src/modules/menus/services/menu-inventory-lifecycle.service");
describe('MenuInventoryLifecycleService', () => {
    const makeRepository = () => ({
        findItemById: jest
            .fn()
            .mockResolvedValueOnce({
            id: 'item_1',
            name: 'Mohinga',
            isStockTracked: true,
            stockQuantity: 5,
            lowStockThreshold: 3,
            branch: {
                id: 'branch_1',
                merchant: {
                    user: {
                        id: 'usr_merchant_1',
                    },
                },
            },
        })
            .mockResolvedValueOnce({
            id: 'item_1',
            name: 'Mohinga',
            isStockTracked: true,
            stockQuantity: 3,
            lowStockThreshold: 3,
            branch: {
                id: 'branch_1',
                merchant: {
                    user: {
                        id: 'usr_merchant_1',
                    },
                },
            },
        }),
        findOptionById: jest
            .fn()
            .mockResolvedValueOnce({
            id: 'option_1',
            name: 'Extra fish cake',
            isStockTracked: true,
            stockQuantity: 2,
            lowStockThreshold: 1,
            group: {
                menuItem: {
                    id: 'item_1',
                    name: 'Mohinga',
                    branch: {
                        id: 'branch_1',
                        merchant: {
                            user: {
                                id: 'usr_merchant_1',
                            },
                        },
                    },
                },
            },
        })
            .mockResolvedValueOnce({
            id: 'option_1',
            name: 'Extra fish cake',
            isStockTracked: true,
            stockQuantity: 0,
            lowStockThreshold: 1,
            group: {
                menuItem: {
                    id: 'item_1',
                    name: 'Mohinga',
                    branch: {
                        id: 'branch_1',
                        merchant: {
                            user: {
                                id: 'usr_merchant_1',
                            },
                        },
                    },
                },
            },
        }),
        countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
        listItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue([]),
        decrementItemInventoryLotQuantity: jest.fn().mockResolvedValue(true),
        incrementItemInventoryLotRemainingQuantity: jest.fn().mockResolvedValue(1),
        decrementTrackedItemStock: jest.fn().mockResolvedValue(true),
        decrementTrackedOptionStock: jest.fn().mockResolvedValue(true),
        incrementItemStock: jest.fn().mockResolvedValue(1),
        incrementOptionStock: jest.fn().mockResolvedValue(1),
    });
    it('reserves tracked item and option inventory together', async () => {
        const repository = makeRepository();
        const service = new menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService(repository);
        const reservation = await service.reserveTrackedInventoryForOrder([
            {
                menuItemId: 'item_1',
                quantity: 2,
                menuItemStockTrackedSnapshot: true,
                selectedOptions: [
                    {
                        itemOptionId: 'option_1',
                        itemOptionStockTrackedSnapshot: true,
                    },
                ],
            },
        ]);
        expect(repository.decrementTrackedItemStock).toHaveBeenCalledWith('item_1', 2, undefined);
        expect(repository.decrementTrackedOptionStock).toHaveBeenCalledWith('option_1', 2, undefined);
        expect(reservation).toEqual({
            alerts: [
                expect.objectContaining({
                    resourceType: 'MENU_ITEM',
                    resourceId: 'item_1',
                    attentionLevel: 'LOW_STOCK',
                }),
                expect.objectContaining({
                    resourceType: 'ITEM_OPTION',
                    resourceId: 'option_1',
                    attentionLevel: 'OUT_OF_STOCK',
                }),
            ],
            inventoryLotAllocationsByLineKey: {},
        });
    });
    it('fails with conflict when a tracked option can no longer be reserved', async () => {
        const repository = makeRepository();
        repository.decrementTrackedOptionStock.mockResolvedValue(false);
        const service = new menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService(repository);
        await expect(service.reserveTrackedInventoryForOrder([
            {
                menuItemId: 'item_1',
                quantity: 2,
                menuItemStockTrackedSnapshot: false,
                selectedOptions: [
                    {
                        itemOptionId: 'option_1',
                        itemOptionStockTrackedSnapshot: true,
                    },
                ],
            },
        ])).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('allocates tracked menu item stock across inventory lots using FEFO ordering', async () => {
        const repository = makeRepository();
        repository.countItemInventoryLotsByMenuItemId.mockResolvedValue(1);
        repository.listItemInventoryLotsByMenuItemId.mockResolvedValue([
            {
                id: 'lot_late',
                menuItemId: 'item_1',
                batchNo: 'BATCH-LATE',
                expiryDate: new Date('2026-06-15T00:00:00.000Z'),
                receivedAt: new Date('2026-05-02T10:00:00.000Z'),
                receivedQuantity: 4,
                remainingQuantity: 4,
                note: null,
                createdAt: new Date('2026-05-02T10:00:00.000Z'),
                updatedAt: new Date('2026-05-02T10:00:00.000Z'),
                menuItem: {
                    id: 'item_1',
                    name: 'Mohinga',
                    isStockTracked: true,
                    stockQuantity: 5,
                    lowStockThreshold: 3,
                    branch: {
                        id: 'branch_1',
                        merchantId: 'merchant_1',
                        merchant: {
                            id: 'merchant_1',
                            user: {
                                id: 'usr_merchant_1',
                                phone: '0999999999',
                                role: 'MERCHANT',
                                status: 'ACTIVE',
                            },
                        },
                    },
                },
            },
            {
                id: 'lot_early',
                menuItemId: 'item_1',
                batchNo: 'BATCH-EARLY',
                expiryDate: new Date('2026-05-10T00:00:00.000Z'),
                receivedAt: new Date('2026-05-01T10:00:00.000Z'),
                receivedQuantity: 1,
                remainingQuantity: 1,
                note: null,
                createdAt: new Date('2026-05-01T10:00:00.000Z'),
                updatedAt: new Date('2026-05-01T10:00:00.000Z'),
                menuItem: {
                    id: 'item_1',
                    name: 'Mohinga',
                    isStockTracked: true,
                    stockQuantity: 5,
                    lowStockThreshold: 3,
                    branch: {
                        id: 'branch_1',
                        merchantId: 'merchant_1',
                        merchant: {
                            id: 'merchant_1',
                            user: {
                                id: 'usr_merchant_1',
                                phone: '0999999999',
                                role: 'MERCHANT',
                                status: 'ACTIVE',
                            },
                        },
                    },
                },
            },
        ]);
        const service = new menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService(repository);
        const reservation = await service.reserveTrackedInventoryForOrder([
            {
                lineKey: 'cart_item_1',
                menuItemId: 'item_1',
                quantity: 3,
                menuItemStockTrackedSnapshot: true,
                selectedOptions: [],
            },
        ]);
        expect(repository.decrementItemInventoryLotQuantity).toHaveBeenNthCalledWith(1, 'lot_early', 1, undefined);
        expect(repository.decrementItemInventoryLotQuantity).toHaveBeenNthCalledWith(2, 'lot_late', 2, undefined);
        expect(reservation.inventoryLotAllocationsByLineKey).toEqual({
            cart_item_1: [
                {
                    inventoryLotId: 'lot_early',
                    batchNoSnapshot: 'BATCH-EARLY',
                    expiryDateSnapshot: '2026-05-10T00:00:00.000Z',
                    quantity: 1,
                },
                {
                    inventoryLotId: 'lot_late',
                    batchNoSnapshot: 'BATCH-LATE',
                    expiryDateSnapshot: '2026-06-15T00:00:00.000Z',
                    quantity: 2,
                },
            ],
        });
    });
    it('restores only tracked item and option inventory snapshots', async () => {
        const repository = makeRepository();
        const service = new menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService(repository);
        await service.restoreTrackedInventoryForOrder([
            {
                menuItemId: 'item_1',
                quantity: 1,
                menuItemStockTrackedSnapshot: true,
                inventoryLotAllocations: [
                    {
                        inventoryLotId: 'lot_1',
                        batchNoSnapshot: 'BATCH-001',
                        expiryDateSnapshot: '2026-05-30T00:00:00.000Z',
                        quantity: 1,
                    },
                ],
                selectedOptions: [
                    {
                        itemOptionId: 'option_1',
                        itemOptionStockTrackedSnapshot: false,
                    },
                    {
                        itemOptionId: 'option_2',
                        itemOptionStockTrackedSnapshot: true,
                    },
                ],
            },
        ]);
        expect(repository.incrementItemStock).toHaveBeenCalledWith('item_1', 1, undefined);
        expect(repository.incrementItemInventoryLotRemainingQuantity).toHaveBeenCalledWith('lot_1', 1, undefined);
        expect(repository.incrementOptionStock).toHaveBeenCalledTimes(1);
        expect(repository.incrementOptionStock).toHaveBeenCalledWith('option_2', 1, undefined);
    });
    it('collects aggregated compensation alerts after tracked inventory restoration', async () => {
        const repository = makeRepository();
        repository.findItemById.mockReset().mockResolvedValue({
            id: 'item_1',
            name: 'Mohinga',
            isStockTracked: true,
            stockQuantity: 6,
            lowStockThreshold: 3,
            branch: {
                id: 'branch_1',
                merchant: {
                    user: {
                        id: 'usr_merchant_1',
                    },
                },
            },
        });
        repository.findOptionById.mockReset().mockResolvedValue({
            id: 'option_2',
            name: 'Extra fish cake',
            isStockTracked: true,
            stockQuantity: 4,
            lowStockThreshold: 1,
            group: {
                menuItem: {
                    id: 'item_1',
                    name: 'Mohinga',
                    branch: {
                        id: 'branch_1',
                        merchant: {
                            user: {
                                id: 'usr_merchant_1',
                            },
                        },
                    },
                },
            },
        });
        const service = new menu_inventory_lifecycle_service_1.MenuInventoryLifecycleService(repository);
        const alerts = await service.collectTrackedInventoryRestorationAlerts([
            {
                menuItemId: 'item_1',
                quantity: 1,
                menuItemStockTrackedSnapshot: true,
                selectedOptions: [
                    {
                        itemOptionId: 'option_2',
                        itemOptionStockTrackedSnapshot: true,
                    },
                ],
            },
            {
                menuItemId: 'item_1',
                quantity: 2,
                menuItemStockTrackedSnapshot: true,
                selectedOptions: [
                    {
                        itemOptionId: 'option_2',
                        itemOptionStockTrackedSnapshot: true,
                    },
                ],
            },
        ]);
        expect(alerts).toEqual([
            expect.objectContaining({
                resourceType: 'MENU_ITEM',
                resourceId: 'item_1',
                restoredQuantity: 3,
                stockQuantity: 6,
            }),
            expect.objectContaining({
                resourceType: 'ITEM_OPTION',
                resourceId: 'option_2',
                restoredQuantity: 3,
                stockQuantity: 4,
            }),
        ]);
    });
});
//# sourceMappingURL=menu-inventory-lifecycle.service.spec.js.map