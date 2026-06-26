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
exports.MenuItemInventoryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const menu_item_dto_1 = require("../dto/menu-item.dto");
const menus_repository_1 = require("../repositories/menus.repository");
let MenuItemInventoryService = class MenuItemInventoryService {
    constructor(prisma, menusRepository, auditService, notificationEventService) {
        this.prisma = prisma;
        this.menusRepository = menusRepository;
        this.auditService = auditService;
        this.notificationEventService = notificationEventService;
    }
    async adjustBranchItemInventory(currentUser, item, payload) {
        this.assertStockTrackingEnabled(item.isStockTracked);
        await this.assertItemDoesNotUseLots(item.id);
        const normalizedReasonCode = this.requireReasonCode(payload.reasonCode);
        const normalizedNote = this.normalizeOptionalString(payload.note);
        const updatedItem = await this.prisma.runInTransaction(async (tx) => {
            const adjusted = await this.menusRepository.adjustTrackedItemStock(item.id, payload.delta, tx);
            if (!adjusted) {
                throw new app_exception_1.AppException('The requested inventory adjustment would make the stock quantity invalid.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        itemId: item.id,
                        requestedDelta: payload.delta,
                        currentStockQuantity: item.stockQuantity ?? 0,
                    },
                });
            }
            return this.menusRepository.findItemById(item.id, tx);
        });
        if (updatedItem === null) {
            throw new app_exception_1.AppException('Adjusted menu item could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_items.inventory_adjusted',
            resourceType: client_1.AuditResourceType.MENU_ITEM,
            resourceId: updatedItem.id,
            resourceLabel: updatedItem.name,
            branchId: updatedItem.branch.id,
            metadataJson: {
                delta: payload.delta,
                reasonCode: normalizedReasonCode,
                note: normalizedNote,
                beforeStockQuantity: item.stockQuantity,
                afterStockQuantity: updatedItem.stockQuantity,
                lowStockThreshold: updatedItem.lowStockThreshold,
            },
        });
        await this.publishInventoryAlertIfNeeded(item, updatedItem);
        return (0, menu_item_dto_1.toMenuItemDto)(updatedItem);
    }
    normalizeCreateInventory(payload) {
        const hasInventoryFields = payload.stockQuantity !== undefined ||
            payload.lowStockThreshold !== undefined;
        const isStockTracked = payload.isStockTracked ?? hasInventoryFields;
        this.assertInventoryValue('stockQuantity', payload.stockQuantity);
        this.assertInventoryValue('lowStockThreshold', payload.lowStockThreshold);
        if (!isStockTracked) {
            return {
                isStockTracked: false,
                stockQuantity: null,
                lowStockThreshold: null,
            };
        }
        return {
            isStockTracked: true,
            stockQuantity: payload.stockQuantity ?? 0,
            lowStockThreshold: payload.lowStockThreshold ?? null,
        };
    }
    normalizeUpdateInventory(payload, item) {
        const hasInventoryFields = payload.isStockTracked !== undefined ||
            payload.stockQuantity !== undefined ||
            payload.lowStockThreshold !== undefined;
        if (!hasInventoryFields) {
            return {};
        }
        this.assertInventoryValue('stockQuantity', payload.stockQuantity);
        this.assertInventoryValue('lowStockThreshold', payload.lowStockThreshold);
        const isStockTracked = payload.isStockTracked ??
            (payload.stockQuantity !== undefined ||
                payload.lowStockThreshold !== undefined ||
                item.isStockTracked);
        if (!isStockTracked) {
            return {
                isStockTracked: false,
                stockQuantity: null,
                lowStockThreshold: null,
            };
        }
        return {
            isStockTracked: true,
            ...(payload.stockQuantity !== undefined
                ? { stockQuantity: payload.stockQuantity }
                : item.isStockTracked
                    ? {}
                    : { stockQuantity: 0 }),
            ...(payload.lowStockThreshold !== undefined
                ? { lowStockThreshold: payload.lowStockThreshold }
                : {}),
        };
    }
    resolveNextItemStockTracking(payload, item) {
        return (payload.isStockTracked ??
            (payload.stockQuantity !== undefined ||
                payload.lowStockThreshold !== undefined ||
                item.isStockTracked));
    }
    assertInventoryValue(name, value) {
        if (value === undefined) {
            return;
        }
        if (!Number.isInteger(value) || value < 0) {
            throw new app_exception_1.AppException(`${name} must be a whole number greater than or equal to zero.`, common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.validationFailed,
            });
        }
    }
    assertStockTrackingEnabled(isStockTracked) {
        if (isStockTracked) {
            return;
        }
        throw new app_exception_1.AppException('Inventory adjustments require stock tracking to be enabled.', common_1.HttpStatus.CONFLICT, {
            code: error_codes_1.ErrorCodes.conflict,
        });
    }
    async assertItemDoesNotUseLots(itemId) {
        const lotCount = await this.menusRepository.countItemInventoryLotsByMenuItemId(itemId);
        if (lotCount === 0) {
            return;
        }
        throw new app_exception_1.AppException('Direct item-level inventory adjustments are disabled once inventory lots exist. Adjust the relevant lot instead.', common_1.HttpStatus.CONFLICT, {
            code: error_codes_1.ErrorCodes.conflict,
            details: {
                itemId,
                lotCount,
            },
        });
    }
    requireReasonCode(reasonCode) {
        const normalizedReasonCode = this.normalizeOptionalString(reasonCode);
        if (normalizedReasonCode === null) {
            throw new app_exception_1.AppException('A reason code is required for inventory adjustments.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return normalizedReasonCode;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? null : normalized;
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
exports.MenuItemInventoryService = MenuItemInventoryService;
exports.MenuItemInventoryService = MenuItemInventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        menus_repository_1.MenusRepository,
        audit_service_1.AuditService,
        notification_event_service_1.NotificationEventService])
], MenuItemInventoryService);
//# sourceMappingURL=menu-item-inventory.service.js.map