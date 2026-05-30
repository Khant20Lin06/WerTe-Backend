import { HttpStatus } from '@nestjs/common';
import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { MenusRepository } from '../../../../src/modules/menus/repositories/menus.repository';
import { MerchantMenuItemInventoryLotsService } from '../../../../src/modules/menus/services/merchant-menu-item-inventory-lots.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';

describe('MerchantMenuItemInventoryLotsService', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_merchant_1',
    role: UserRole.MERCHANT,
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  });

  const makePrismaService = () =>
    ({
      runInTransaction: jest.fn(
        async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          callback({} as Prisma.TransactionClient),
      ),
    } as unknown as PrismaService);

  const makeMenuItem = (overrides?: Record<string, unknown>) => ({
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
          role: UserRole.MERCHANT,
          status: UserStatus.ACTIVE,
        },
      },
    },
    ...overrides,
  });

  const makeLot = (overrides?: Record<string, unknown>) => ({
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

  const makeAuditService = () =>
    ({
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>);

  const makeNotificationEventService = () =>
    ({
      publishMerchantInventoryAlert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationEventService>);

  it('creates a new inventory lot and increments aggregate item stock', async () => {
    const menusRepository = {
      countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
      findItemInventoryLotByMenuItemIdAndBatchNo: jest.fn().mockResolvedValue(null),
      createItemInventoryLot: jest.fn().mockResolvedValue(makeLot()),
      incrementItemStock: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<MenusRepository>;
    const auditService = makeAuditService();
    const service = new MerchantMenuItemInventoryLotsService(
      makePrismaService(),
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(makeMenuItem()),
      } as unknown as MenusService,
      menusRepository,
      auditService,
      makeNotificationEventService(),
    );

    const result = await service.createItemInventoryLot(
      currentUser,
      'branch_1',
      'item_1',
      {
        batchNo: 'BATCH-001',
        expiryDate: '2026-05-30T00:00:00.000Z',
        quantity: 12,
        note: 'Initial pharmacy delivery',
      },
    );

    expect(menusRepository.createItemInventoryLot).toHaveBeenCalledWith(
      expect.objectContaining({
        menuItemId: 'item_1',
        batchNo: 'BATCH-001',
        receivedQuantity: 12,
        remainingQuantity: 12,
      }),
      expect.anything(),
    );
    expect(menusRepository.incrementItemStock).toHaveBeenCalledWith(
      'item_1',
      12,
      expect.anything(),
    );
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actorType: AuditActorType.USER,
        actionSource: AuditActionSource.API,
        action: 'menu_items.inventory_lot_created',
        resourceType: AuditResourceType.MENU_ITEM,
        resourceId: 'item_1',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'lot_1',
        batchNo: 'BATCH-001',
        remainingQuantity: 12,
      }),
    );
  });

  it('rejects the first lot bootstrap when direct item stock is already positive', async () => {
    const service = new MerchantMenuItemInventoryLotsService(
      makePrismaService(),
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeMenuItem({
            stockQuantity: 8,
          }),
        ),
      } as unknown as MenusService,
      {
        countItemInventoryLotsByMenuItemId: jest.fn().mockResolvedValue(0),
      } as unknown as MenusRepository,
      makeAuditService(),
      makeNotificationEventService(),
    );

    await expect(
      service.createItemInventoryLot(currentUser, 'branch_1', 'item_1', {
        batchNo: 'BATCH-001',
        quantity: 4,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
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
      findItemById: jest.fn().mockResolvedValue(
        makeMenuItem({
          stockQuantity: 9,
        }),
      ),
    } as unknown as jest.Mocked<MenusRepository>;
    const notificationEventService = makeNotificationEventService();
    const service = new MerchantMenuItemInventoryLotsService(
      makePrismaService(),
      {
        findItemOwnedByUserId: jest.fn().mockResolvedValue(
          makeMenuItem({
            stockQuantity: 12,
          }),
        ),
        findItemInventoryLotById: jest.fn().mockResolvedValue(
          makeLot({
            remainingQuantity: 12,
            receivedQuantity: 12,
          }),
        ),
      } as unknown as MenusService,
      menusRepository,
      makeAuditService(),
      notificationEventService,
    );

    const result = await service.adjustItemInventoryLot(
      currentUser,
      'branch_1',
      'item_1',
      'lot_1',
      {
        delta: -3,
        reasonCode: 'manual_count_correction',
      },
    );

    expect(menusRepository.adjustItemInventoryLotQuantity).toHaveBeenCalledWith(
      'lot_1',
      -3,
      expect.anything(),
    );
    expect(menusRepository.adjustTrackedItemStock).toHaveBeenCalledWith(
      'item_1',
      -3,
      expect.anything(),
    );
    expect(notificationEventService.publishMerchantInventoryAlert).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        id: 'lot_1',
        remainingQuantity: 9,
      }),
    );
  });
});
