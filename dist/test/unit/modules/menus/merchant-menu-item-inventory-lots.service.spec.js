"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const merchant_menu_item_inventory_lots_service_1 = require("../../../../src/modules/menus/services/merchant-menu-item-inventory-lots.service");
describe('MerchantMenuItemInventoryLotsService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_merchant_1',
        role: client_1.UserRole.MERCHANT,
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    });
    const makePrismaService = () => ({
        runInTransaction: jest.fn(async (callback) => callback({})),
    });
    const makeMenuItem = (overrides) => ({
        id: 'item_1',
        name: 'Vitamin C',
        isStockTracked: true,
        stockQuantity: 0,
        lowStockThreshold: 2,
        branch: {
            id: 'branch_1',
            merchantId: 'merchant_1',
            merchant: {
                id: 'merchant_1',
                user: {
                    id: 'usr_merchant_1',
                    phone: '0999999999',
                    role: client_1.UserRole.MERCHANT,
                    status: client_1.UserStatus.ACTIVE,
                },
            },
        },
        ...overrides,
    });
    const makeLot = (overrides) => ({
        id: 'lot_1',
        menuItemId: 'item_1',
        batchNo: 'BATCH-001',
        expiryDate: new Date('2026-05-30T00:00:00.000Z'),
        receivedAt: new Date('2026-05-02T10:00:00.000Z'),
        receivedQuantity: 12,
        remainingQuantity: 12,
        note: 'Initial pharmacy delivery',
        createdAt: new Date('2026-05-02T10:00:00.000Z'),
        updatedAt: new Date('2026-05-02T10:00:00.000Z'),
        menuItem: makeMenuItem(),
        ...overrides,
    });
    const makeAuditService = () => ({
        logAction: jest.fn().mockResolvedValue(undefined),
    });
    const makeNotificationEventService = () => ({
        publishMerchantInventoryAlert: jest.fn().mockResolvedValue(undefined),
    });
    it('creates a new inventory lot and increments aggregate item stock', async () => {
        const menusRepository = {
            countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
            findItemInventoryLotByMenuItemIdAndBatchNo: jest.fn().mockResolvedValue(null),
            createItemInventoryLot: jest.fn().mockResolvedValue(makeLot()),
            incrementItemStock: jest.fn().mockResolvedValue(1),
        };
        const auditService = makeAuditService();
        const service = new merchant_menu_item_inventory_lots_service_1.MerchantMenuItemInventoryLotsService(makePrismaService(), {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeMenuItem()),
        }, menusRepository, auditService, makeNotificationEventService());
        const result = await service.createItemInventoryLot(currentUser, 'branch_1', 'item_1', {
            batchNo: 'BATCH-001',
            expiryDate: '2026-05-30T00:00:00.000Z',
            quantity: 12,
            note: 'Initial pharmacy delivery',
        });
        expect(menusRepository.createItemInventoryLot).toHaveBeenCalledWith(expect.objectContaining({
            menuItemId: 'item_1',
            batchNo: 'BATCH-001',
            receivedQuantity: 12,
            remainingQuantity: 12,
        }), expect.anything());
        expect(menusRepository.incrementItemStock).toHaveBeenCalledWith('item_1', 12, expect.anything());
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            actorType: client_1.AuditActorType.USER,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_items.inventory_lot_created',
            resourceType: client_1.AuditResourceType.MENU_ITEM,
            resourceId: 'item_1',
        }));
        expect(result).toEqual(expect.objectContaining({
            id: 'lot_1',
            batchNo: 'BATCH-001',
            remainingQuantity: 12,
        }));
    });
    it('rejects the first lot bootstrap when direct item stock is already positive', async () => {
        const service = new merchant_menu_item_inventory_lots_service_1.MerchantMenuItemInventoryLotsService(makePrismaService(), {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeMenuItem({
                stockQuantity: 8,
            })),
        }, {
            countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
        }, makeAuditService(), makeNotificationEventService());
        await expect(service.createItemInventoryLot(currentUser, 'branch_1', 'item_1', {
            batchNo: 'BATCH-001',
            quantity: 4,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.conflict,
            }),
        });
    });
    it('adjusts a lot quantity and keeps aggregate stock in sync', async () => {
        const menusRepository = {
            adjustItemInventoryLotQuantity: jest.fn().mockResolvedValue(true),
            adjustTrackedItemStock: jest.fn().mockResolvedValue(true),
            findItemInventoryLotById: jest
                .fn()
                .mockResolvedValue(makeLot({ remainingQuantity: 9, receivedQuantity: 12 })),
            findItemById: jest.fn().mockResolvedValue(makeMenuItem({
                stockQuantity: 9,
            })),
        };
        const notificationEventService = makeNotificationEventService();
        const service = new merchant_menu_item_inventory_lots_service_1.MerchantMenuItemInventoryLotsService(makePrismaService(), {
            findItemOwnedByUserId: jest.fn().mockResolvedValue(makeMenuItem({
                stockQuantity: 12,
            })),
            findItemInventoryLotById: jest.fn().mockResolvedValue(makeLot({
                remainingQuantity: 12,
                receivedQuantity: 12,
            })),
        }, menusRepository, makeAuditService(), notificationEventService);
        const result = await service.adjustItemInventoryLot(currentUser, 'branch_1', 'item_1', 'lot_1', {
            delta: -3,
            reasonCode: 'manual_count_correction',
        });
        expect(menusRepository.adjustItemInventoryLotQuantity).toHaveBeenCalledWith('lot_1', -3, expect.anything());
        expect(menusRepository.adjustTrackedItemStock).toHaveBeenCalledWith('item_1', -3, expect.anything());
        expect(notificationEventService.publishMerchantInventoryAlert).not.toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({
            id: 'lot_1',
            remainingQuantity: 9,
        }));
    });
});
//# sourceMappingURL=merchant-menu-item-inventory-lots.service.spec.js.map