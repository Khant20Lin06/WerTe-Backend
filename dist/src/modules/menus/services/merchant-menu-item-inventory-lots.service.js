"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantMenuItemInventoryLotsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const item_inventory_lot_dto_1 = require("../dto/item-inventory-lot.dto");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuItemInventoryLotsService = class MerchantMenuItemInventoryLotsService {
    constructor(prisma, menusService, menusRepository, auditService, notificationEventService) {
        this.prisma = prisma;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.auditService = auditService;
        this.notificationEventService = notificationEventService;
    }
    async listItemInventoryLots(currentUser, branchId, itemId) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const lots = await this.menusService.listItemInventoryLotsByMenuItemId(item.id);
        return lots.map((lot) => (0, item_inventory_lot_dto_1.toItemInventoryLotDto)(lot));
    }
    async createItemInventoryLot(currentUser, branchId, itemId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        this.assertStockTrackingEnabled(item);
        const batchNo = this.requireBatchNo(payload.batchNo);
        const note = this.normalizeOptionalString(payload.note);
        const createdLot = await this.prisma.runInTransaction(async (tx) => {
            const existingLotCount = await this.menusRepository.countItemInventoryLotsByMenuItemId(item.id, tx);
            if (existingLotCount === 0 && (item.stockQuantity ?? 0) > 0) {
                throw new app_exception_1.AppException('The first inventory lot can only be created when the item aggregate stock is zero. Reset or consume the direct stock first, then bootstrap lots.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        itemId: item.id,
                        currentStockQuantity: item.stockQuantity ?? 0,
                    },
                });
            }
            const existingLot = await this.menusRepository.findItemInventoryLotByMenuItemIdAndBatchNo(item.id, batchNo, tx);
            if (existingLot !== null) {
                throw new app_exception_1.AppException('An inventory lot with the same batch number already exists for this item.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        itemId: item.id,
                        batchNo,
                    },
                });
            }
            const lot = await this.menusRepository.createItemInventoryLot({
                menuItemId: item.id,
                batchNo,
                expiryDate: this.toOptionalDate(payload.expiryDate),
                receivedAt: this.toOptionalDate(payload.receivedAt) ?? new Date(),
                receivedQuantity: payload.quantity,
                remainingQuantity: payload.quantity,
                note,
            }, tx);
            await this.menusRepository.incrementItemStock(item.id, payload.quantity, tx);
            return lot;
        });
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_items.inventory_lot_created',
            resourceType: client_1.AuditResourceType.MENU_ITEM,
            resourceId: item.id,
            resourceLabel: item.name,
            branchId: item.branch.id,
            metadataJson: {
                lotId: createdLot.id,
                batchNo: createdLot.batchNo,
                expiryDate: createdLot.expiryDate?.toISOString() ?? null,
                receivedQuantity: createdLot.receivedQuantity,
                remainingQuantity: createdLot.remainingQuantity,
                note,
            },
        });
        return (0, item_inventory_lot_dto_1.toItemInventoryLotDto)(createdLot);
    }
    async updateItemInventoryLot(currentUser, branchId, itemId, lotId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const lot = await this.resolveOwnedLot(item.id, lotId);
        const batchNo = payload.batchNo !== undefined ? this.requireBatchNo(payload.batchNo) : undefined;
        const note = payload.note !== undefined ? this.normalizeOptionalString(payload.note) : undefined;
        const updatedLot = await this.prisma.runInTransaction(async (tx) => {
            if (batchNo !== undefined && batchNo !== lot.batchNo) {
                const existingLot = await this.menusRepository.findItemInventoryLotByMenuItemIdAndBatchNo(item.id, batchNo, tx);
                if (existingLot !== null && existingLot.id !== lot.id) {
                    throw new app_exception_1.AppException('An inventory lot with the same batch number already exists for this item.', common_1.HttpStatus.CONFLICT, {
                        code: error_codes_1.ErrorCodes.conflict,
                        details: {
                            itemId: item.id,
                            batchNo,
                        },
                    });
                }
            }
            return this.menusRepository.updateItemInventoryLot(lot.id, {
                ...(batchNo !== undefined ? { batchNo } : {}),
                ...(payload.expiryDate !== undefined
                    ? { expiryDate: this.toOptionalDate(payload.expiryDate) }
                    : {}),
                ...(payload.receivedAt !== undefined
                    ? { receivedAt: this.toDateOrUndefined(payload.receivedAt) }
                    : {}),
                ...(note !== undefined ? { note } : {}),
            }, tx);
        });
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_items.inventory_lot_updated',
            resourceType: client_1.AuditResourceType.MENU_ITEM,
            resourceId: item.id,
            resourceLabel: item.name,
            branchId: item.branch.id,
            metadataJson: {
                lotId: updatedLot.id,
                batchNo: updatedLot.batchNo,
                expiryDate: updatedLot.expiryDate?.toISOString() ?? null,
                receivedAt: updatedLot.receivedAt.toISOString(),
                note: updatedLot.note ?? null,
            },
        });
        return (0, item_inventory_lot_dto_1.toItemInventoryLotDto)(updatedLot);
    }
    async adjustItemInventoryLot(currentUser, branchId, itemId, lotId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const lot = await this.resolveOwnedLot(item.id, lotId);
        this.assertStockTrackingEnabled(item);
        const reasonCode = this.requireReasonCode(payload.reasonCode);
        const note = this.normalizeOptionalString(payload.note);
        const { updatedLot, updatedItem } = await this.prisma.runInTransaction(async (tx) => {
            const adjustedLot = await this.menusRepository.adjustItemInventoryLotQuantity(lot.id, payload.delta, tx);
            if (!adjustedLot) {
                throw new app_exception_1.AppException('The requested lot adjustment would make the remaining quantity invalid.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        itemId: item.id,
                        lotId: lot.id,
                        requestedDelta: payload.delta,
                        currentRemainingQuantity: lot.remainingQuantity,
                    },
                });
            }
            const adjustedItem = await this.menusRepository.adjustTrackedItemStock(item.id, payload.delta, tx);
            if (!adjustedItem) {
                throw new app_exception_1.AppException('The requested lot adjustment would make the aggregate stock quantity invalid.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        itemId: item.id,
                        lotId: lot.id,
                        requestedDelta: payload.delta,
                        currentStockQuantity: item.stockQuantity ?? 0,
                    },
                });
            }
            const [nextLot, nextItem] = await Promise.all([
                this.menusRepository.findItemInventoryLotById(lot.id, tx),
                this.menusRepository.findItemById(item.id, tx),
            ]);
            if (nextLot === null || nextItem === null) {
                throw new app_exception_1.AppException('The adjusted inventory lot could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                    code: error_codes_1.ErrorCodes.internalServerError,
                });
            }
            return {
                updatedLot: nextLot,
                updatedItem: nextItem,
            };
        });
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_items.inventory_lot_adjusted',
            resourceType: client_1.AuditResourceType.MENU_ITEM,
            resourceId: item.id,
            resourceLabel: item.name,
            branchId: item.branch.id,
            metadataJson: {
                lotId: updatedLot.id,
                delta: payload.delta,
                reasonCode,
                note,
                batchNo: updatedLot.batchNo,
                beforeRemainingQuantity: lot.remainingQuantity,
                afterRemainingQuantity: updatedLot.remainingQuantity,
                beforeStockQuantity: item.stockQuantity,
                afterStockQuantity: updatedItem.stockQuantity,
            },
        });
        await this.publishInventoryAlertIfNeeded(item, updatedItem);
        return (0, item_inventory_lot_dto_1.toItemInventoryLotDto)(updatedLot);
    }
    async hasItemInventoryLots(itemId) {
        return (await this.menusRepository.countItemInventoryLotsByMenuItemId(itemId)) > 0;
    }
    async resolveOwnedItem(currentUser, branchId, itemId) {
        const item = await this.menusService.findItemOwnedByUserId(currentUser.userId, itemId);
        if (item === null || item.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu item was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return item;
    }
    async resolveOwnedLot(menuItemId, lotId) {
        const lot = await this.menusService.findItemInventoryLotById(lotId);
        if (lot === null || lot.menuItem.id !== menuItemId) {
            throw new app_exception_1.AppException('Inventory lot was not found for the requested menu item.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return lot;
    }
    assertStockTrackingEnabled(item) {
        if (item.isStockTracked) {
            return;
        }
        throw new app_exception_1.AppException('Inventory lots require stock tracking to be enabled for the menu item.', common_1.HttpStatus.CONFLICT, {
            code: error_codes_1.ErrorCodes.conflict,
        });
    }
    requireBatchNo(batchNo) {
        const normalized = batchNo.trim();
        if (normalized.length === 0) {
            throw new app_exception_1.AppException('batchNo is required for inventory lots.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return normalized;
    }
    requireReasonCode(reasonCode) {
        const normalized = this.normalizeOptionalString(reasonCode);
        if (normalized === null) {
            throw new app_exception_1.AppException('A reason code is required for inventory adjustments.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return normalized;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? null : normalized;
    }
    toOptionalDate(value) {
        if (value === undefined) {
            return undefined;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? null : new Date(normalized);
    }
    toDateOrUndefined(value) {
        if (value === undefined) {
            return undefined;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? undefined : new Date(normalized);
    }
    async publishInventoryAlertIfNeeded(previousItem, nextItem) {
        const previousAttentionLevel = this.resolveInventoryAttentionLevel(previousItem);
        const nextAttentionLevel = this.resolveInventoryAttentionLevel(nextItem);
        if (nextAttentionLevel === null) {
            return;
        }
        const shouldNotify = previousAttentionLevel === null ||
            (previousAttentionLevel === 'LOW_STOCK' &&
                nextAttentionLevel === 'OUT_OF_STOCK');
        if (!shouldNotify) {
            return;
        }
        await this.notificationEventService.publishMerchantInventoryAlert({
            merchantUserId: nextItem.branch.merchant.user.id,
            branchId: nextItem.branch.id,
            branchName: null,
            resourceType: 'MENU_ITEM',
            resourceId: nextItem.id,
            resourceLabel: nextItem.name,
            attentionLevel: nextAttentionLevel,
            stockQuantity: nextItem.stockQuantity ?? null,
            lowStockThreshold: nextItem.lowStockThreshold ?? null,
        });
    }
    resolveInventoryAttentionLevel(item) {
        if (!item.isStockTracked) {
            return null;
        }
        if ((item.stockQuantity ?? 0) <= 0) {
            return 'OUT_OF_STOCK';
        }
        if (item.lowStockThreshold !== null &&
            item.lowStockThreshold !== undefined &&
            item.stockQuantity !== null &&
            item.stockQuantity <= item.lowStockThreshold) {
            return 'LOW_STOCK';
        }
        return null;
    }
};
exports.MerchantMenuItemInventoryLotsService = MerchantMenuItemInventoryLotsService;
exports.MerchantMenuItemInventoryLotsService = MerchantMenuItemInventoryLotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        audit_service_1.AuditService,
        notification_event_service_1.NotificationEventService])
], MerchantMenuItemInventoryLotsService);
//# sourceMappingURL=merchant-menu-item-inventory-lots.service.js.map