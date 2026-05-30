import { AuditResourceType, UserRole } from '@prisma/client';

import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';
import {
  MerchantInventoryAttentionLevel,
} from '../../../../src/modules/menus/dto/merchant-inventory-overview.dto';
import { MerchantInventoryReadService } from '../../../../src/modules/menus/services/merchant-inventory-read.service';

describe('MerchantInventoryReadService', () => {
  const makeBranchesService = () =>
    ({
      findOwnedByUserId: jest.fn().mockResolvedValue({
        id: 'branch_1',
        name: 'Downtown Branch',
        township: 'Botahtaung',
      }),
    }) as unknown as jest.Mocked<BranchesService>;

  const makeMenusService = () =>
    ({
      listItemsByBranchId: jest.fn().mockResolvedValue([
        {
          id: 'item_1',
          category: {
            id: 'cat_1',
            name: 'Popular',
          },
        },
        {
          id: 'item_2',
          category: null,
        },
      ]),
      listOptionsByBranchId: jest.fn().mockResolvedValue([
        {
          id: 'option_1',
          group: {
            id: 'group_1',
            name: 'Choose extras',
            menuItem: {
              id: 'item_1',
              name: 'Mohinga',
            },
          },
        },
        {
          id: 'option_2',
          group: {
            id: 'group_1',
            name: 'Choose extras',
            menuItem: {
              id: 'item_1',
              name: 'Mohinga',
            },
          },
        },
      ]),
      buildItemOwnership: jest
        .fn()
        .mockReturnValueOnce({
          itemId: 'item_1',
          categoryId: 'cat_1',
          name: 'Mohinga',
          sku: 'SKU-MHG-001',
          isStockTracked: true,
          stockQuantity: 2,
          lowStockThreshold: 3,
          isInStock: true,
          isLowStock: true,
        })
        .mockReturnValueOnce({
          itemId: 'item_2',
          categoryId: null,
          name: 'Tea Leaf Salad',
          sku: null,
          isStockTracked: true,
          stockQuantity: 0,
          lowStockThreshold: null,
          isInStock: false,
          isLowStock: false,
        }),
      buildOptionOwnership: jest
        .fn()
        .mockReturnValueOnce({
          optionId: 'option_1',
          optionGroupId: 'group_1',
          menuItemId: 'item_1',
          name: 'Extra fish cake',
          isStockTracked: true,
          stockQuantity: 1,
          lowStockThreshold: 2,
          isInStock: true,
          isLowStock: true,
        })
        .mockReturnValueOnce({
          optionId: 'option_2',
          optionGroupId: 'group_1',
          menuItemId: 'item_1',
          name: 'Extra broth',
          isStockTracked: true,
          stockQuantity: 0,
          lowStockThreshold: null,
          isInStock: false,
          isLowStock: false,
        }),
    }) as unknown as jest.Mocked<MenusService>;

  const makeAuditService = () =>
    ({
      listBranchInventoryAdjustmentLogs: jest.fn().mockResolvedValue([
        {
          auditLogId: 'audit_1',
          resourceType: AuditResourceType.MENU_ITEM,
          resourceId: 'item_1',
          resourceLabel: 'Mohinga',
          metadata: {
            delta: -2,
            reasonCode: 'manual_writeoff_damaged_stock',
            note: 'Damaged pack removed.',
            beforeStockQuantity: 10,
            afterStockQuantity: 8,
            lowStockThreshold: 3,
          },
          actorUser: {
            userId: 'usr_merchant_1',
            role: UserRole.MERCHANT,
            phone: '0999999999',
          },
          createdAt: '2026-05-01T10:00:00.000Z',
        },
      ]),
    }) as unknown as jest.Mocked<AuditService>;

  it('builds merchant inventory overview totals and attention rows', async () => {
    const service = new MerchantInventoryReadService(
      makeBranchesService(),
      makeMenusService(),
      makeAuditService(),
    );

    const result = await service.getOwnedBranchInventoryOverview(
      'usr_merchant_1',
      'branch_1',
    );

    expect(result).toMatchObject({
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      township: 'Botahtaung',
      totals: {
        trackedItemCount: 2,
        lowStockItemCount: 1,
        outOfStockItemCount: 1,
        trackedOptionCount: 2,
        lowStockOptionCount: 1,
        outOfStockOptionCount: 1,
      },
      attentionItems: [
        expect.objectContaining({
          itemId: 'item_1',
          attentionLevel: MerchantInventoryAttentionLevel.LOW_STOCK,
        }),
        expect.objectContaining({
          itemId: 'item_2',
          attentionLevel: MerchantInventoryAttentionLevel.OUT_OF_STOCK,
        }),
      ],
      attentionOptions: [
        expect.objectContaining({
          optionId: 'option_1',
          attentionLevel: MerchantInventoryAttentionLevel.LOW_STOCK,
        }),
        expect.objectContaining({
          optionId: 'option_2',
          attentionLevel: MerchantInventoryAttentionLevel.OUT_OF_STOCK,
        }),
      ],
    });
  });

  it('maps branch inventory adjustment audit logs into merchant-facing read models', async () => {
    const auditService = makeAuditService();
    const service = new MerchantInventoryReadService(
      makeBranchesService(),
      makeMenusService(),
      auditService,
    );

    const result = await service.listOwnedBranchInventoryAdjustments(
      'usr_merchant_1',
      'branch_1',
      25,
    );

    expect(auditService.listBranchInventoryAdjustmentLogs).toHaveBeenCalledWith(
      'branch_1',
      25,
    );
    expect(result).toEqual([
      expect.objectContaining({
        auditLogId: 'audit_1',
        resourceType: AuditResourceType.MENU_ITEM,
        resourceId: 'item_1',
        delta: -2,
        reasonCode: 'manual_writeoff_damaged_stock',
        afterStockQuantity: 8,
      }),
    ]);
  });

  it('builds merchant restock suggestions with recent adjustment context', async () => {
    const service = new MerchantInventoryReadService(
      makeBranchesService(),
      makeMenusService(),
      makeAuditService(),
    );

    const result = await service.getOwnedBranchRestockSuggestions(
      'usr_merchant_1',
      'branch_1',
    );

    expect(result.summary).toEqual({
      itemSuggestionCount: 2,
      optionSuggestionCount: 2,
      totalSuggestionCount: 4,
    });
    expect(result.itemSuggestions).toEqual([
      expect.objectContaining({
        itemId: 'item_1',
        attentionLevel: MerchantInventoryAttentionLevel.LOW_STOCK,
        suggestedRestockQuantity: 4,
        lastAdjustedAt: '2026-05-01T10:00:00.000Z',
        lastAdjustmentReasonCode: 'manual_writeoff_damaged_stock',
      }),
      expect.objectContaining({
        itemId: 'item_2',
        attentionLevel: MerchantInventoryAttentionLevel.OUT_OF_STOCK,
        suggestedRestockQuantity: 1,
      }),
    ]);
    expect(result.optionSuggestions).toEqual([
      expect.objectContaining({
        optionId: 'option_1',
        attentionLevel: MerchantInventoryAttentionLevel.LOW_STOCK,
        suggestedRestockQuantity: 3,
      }),
      expect.objectContaining({
        optionId: 'option_2',
        attentionLevel: MerchantInventoryAttentionLevel.OUT_OF_STOCK,
        suggestedRestockQuantity: 1,
      }),
    ]);
  });
});
