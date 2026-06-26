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
exports.MerchantMenuOptionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const item_option_dto_1 = require("../dto/item-option.dto");
const menu_option_policy_service_1 = require("../policies/menu-option-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuOptionsService = class MerchantMenuOptionsService {
    constructor(prisma, menusService, menusRepository, menuOptionPolicyService, auditService, notificationEventService) {
        this.prisma = prisma;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuOptionPolicyService = menuOptionPolicyService;
        this.auditService = auditService;
        this.notificationEventService = notificationEventService;
    }
    async listGroupOptions(currentUser, branchId, itemId, optionGroupId) {
        const optionGroup = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        const options = await this.menusService.listOptionsByOptionGroupId(optionGroup.id);
        return options.map((option) => (0, item_option_dto_1.toItemOptionDto)(option));
    }
    async getGroupOption(currentUser, branchId, itemId, optionGroupId, optionId) {
        const option = await this.resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId);
        return (0, item_option_dto_1.toItemOptionDto)(option);
    }
    async createGroupOption(currentUser, branchId, itemId, optionGroupId, payload) {
        const optionGroup = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        const option = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestOptionSortOrderByOptionGroupId(optionGroup.id, tx))?.sortOrder ?? -1) + 1;
            return this.menusRepository.createOption({
                groupId: optionGroup.id,
                name: payload.name,
                priceDelta: payload.priceDelta,
                ...this.normalizeCreateInventory(payload),
                sortOrder: nextSortOrder,
                isActive: payload.isActive ?? true,
            }, tx);
        });
        return (0, item_option_dto_1.toItemOptionDto)(option);
    }
    async updateGroupOption(currentUser, branchId, itemId, optionGroupId, optionId, payload) {
        const option = await this.resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId);
        const updatedOption = await this.menusRepository.updateOption(option.id, {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.priceDelta !== undefined
                ? { priceDelta: payload.priceDelta }
                : {}),
            ...this.normalizeUpdateInventory(payload, option),
            ...(payload.sortOrder !== undefined
                ? { sortOrder: payload.sortOrder }
                : {}),
            ...(payload.isActive !== undefined
                ? { isActive: payload.isActive }
                : {}),
        });
        return (0, item_option_dto_1.toItemOptionDto)(updatedOption);
    }
    async adjustGroupOptionInventory(currentUser, branchId, itemId, optionGroupId, optionId, payload) {
        const option = await this.resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId);
        this.assertStockTrackingEnabled(option.isStockTracked);
        const normalizedReasonCode = this.requireReasonCode(payload.reasonCode);
        const normalizedNote = this.normalizeOptionalString(payload.note);
        const updatedOption = await this.prisma.runInTransaction(async (tx) => {
            const adjusted = await this.menusRepository.adjustTrackedOptionStock(option.id, payload.delta, tx);
            if (!adjusted) {
                throw new app_exception_1.AppException('The requested inventory adjustment would make the option stock quantity invalid.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        optionId: option.id,
                        requestedDelta: payload.delta,
                        currentStockQuantity: option.stockQuantity ?? 0,
                    },
                });
            }
            return this.menusRepository.findOptionById(option.id, tx);
        });
        if (updatedOption === null) {
            throw new app_exception_1.AppException('Adjusted menu option could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'item_options.inventory_adjusted',
            resourceType: client_1.AuditResourceType.ITEM_OPTION,
            resourceId: updatedOption.id,
            resourceLabel: updatedOption.name,
            branchId: updatedOption.group.menuItem.branch.id,
            metadataJson: {
                delta: payload.delta,
                reasonCode: normalizedReasonCode,
                note: normalizedNote,
                beforeStockQuantity: option.stockQuantity,
                afterStockQuantity: updatedOption.stockQuantity,
                lowStockThreshold: updatedOption.lowStockThreshold,
            },
        });
        await this.publishInventoryAlertIfNeeded(option, updatedOption);
        return (0, item_option_dto_1.toItemOptionDto)(updatedOption);
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
    normalizeUpdateInventory(payload, option) {
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
                option.isStockTracked);
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
                : option.isStockTracked
                    ? {}
                    : { stockQuantity: 0 }),
            ...(payload.lowStockThreshold !== undefined
                ? { lowStockThreshold: payload.lowStockThreshold }
                : {}),
        };
    }
    async deleteGroupOption(currentUser, branchId, itemId, optionGroupId, optionId) {
        const option = await this.resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId);
        await this.menusRepository.deleteOption(option.id);
    }
    async resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId) {
        const optionGroup = await this.menusService.findOptionGroupOwnedByUserId(currentUser.userId, optionGroupId);
        if (optionGroup === null ||
            optionGroup.menuItem.branch.id !== branchId ||
            optionGroup.menuItem.id !== itemId) {
            throw new app_exception_1.AppException('Item option group was not found for the requested menu item.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuOptionPolicyService.canManageOptionGroup(currentUser, optionGroup)) {
            throw new app_exception_1.AppException('You are not allowed to manage options for this option group.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return optionGroup;
    }
    async resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId) {
        const option = await this.menusService.findOptionOwnedByUserId(currentUser.userId, optionId);
        if (option === null ||
            option.group.menuItem.branch.id !== branchId ||
            option.group.menuItem.id !== itemId ||
            option.group.id !== optionGroupId) {
            throw new app_exception_1.AppException('Item option was not found for the requested option group.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuOptionPolicyService.canManageOption(currentUser, option)) {
            throw new app_exception_1.AppException('You are not allowed to manage this option.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return option;
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
    async publishInventoryAlertIfNeeded(previousOption, nextOption) {
        const previousAttentionLevel = this.resolveInventoryAttentionLevel(previousOption);
        const nextAttentionLevel = this.resolveInventoryAttentionLevel(nextOption);
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
            merchantUserId: nextOption.group.menuItem.branch.merchant.user.id,
            branchId: nextOption.group.menuItem.branch.id,
            branchName: null,
            resourceType: 'ITEM_OPTION',
            resourceId: nextOption.id,
            resourceLabel: nextOption.name,
            attentionLevel: nextAttentionLevel,
            stockQuantity: nextOption.stockQuantity ?? null,
            lowStockThreshold: nextOption.lowStockThreshold ?? null,
            menuItemName: nextOption.group.menuItem.name,
        });
    }
    resolveInventoryAttentionLevel(option) {
        if (!option.isStockTracked) {
            return null;
        }
        if ((option.stockQuantity ?? 0) <= 0) {
            return 'OUT_OF_STOCK';
        }
        if (option.lowStockThreshold !== null &&
            option.lowStockThreshold !== undefined &&
            option.stockQuantity !== null &&
            option.stockQuantity <= option.lowStockThreshold) {
            return 'LOW_STOCK';
        }
        return null;
    }
};
exports.MerchantMenuOptionsService = MerchantMenuOptionsService;
exports.MerchantMenuOptionsService = MerchantMenuOptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_option_policy_service_1.MenuOptionPolicyService,
        audit_service_1.AuditService,
        notification_event_service_1.NotificationEventService])
], MerchantMenuOptionsService);
//# sourceMappingURL=merchant-menu-options.service.js.map