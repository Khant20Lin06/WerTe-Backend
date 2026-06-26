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
exports.ListNotificationsQueryDto = void 0;
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const notification_contract_constants_1 = require("../constants/notification-contract.constants");
function transformOptionalBoolean(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
    }
    return undefined;
}
class ListNotificationsQueryDto {
}
exports.ListNotificationsQueryDto = ListNotificationsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of notifications to return.',
        example: 20,
        minimum: 1,
        maximum: notification_contract_constants_1.notificationPageMaxLimit,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(notification_contract_constants_1.notificationPageMaxLimit),
    __metadata("design:type", Number)
], ListNotificationsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Opaque pagination cursor from a previous notification page.',
        example: 'notification_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional notification type filter.',
        enum: client_1.NotificationType,
        example: client_1.NotificationType.SYSTEM_ALERT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.NotificationType),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional preset shortcut for common notification center tabs.',
        enum: notification_contract_constants_1.notificationPresetFilters,
        example: 'INVENTORY_OPEN',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(notification_contract_constants_1.notificationPresetFilters),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "preset", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'When true, returns unread notifications only.',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ListNotificationsQueryDto.prototype, "unreadOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional keyword filter across notification content and inventory alert labels.',
        example: 'mohinga',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory alert kind filter for merchant inventory notification history.',
        enum: notification_contract_constants_1.notificationInventoryAlertKindFilters,
        example: 'ATTENTION',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(notification_contract_constants_1.notificationInventoryAlertKindFilters),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "inventoryAlertKind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory alert status filter for open or resolved history views.',
        enum: notification_contract_constants_1.notificationInventoryAlertStatusFilters,
        example: 'RESOLVED',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(notification_contract_constants_1.notificationInventoryAlertStatusFilters),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "inventoryAlertStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory resource type filter.',
        enum: notification_contract_constants_1.notificationInventoryResourceTypeFilters,
        example: 'ITEM_OPTION',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(notification_contract_constants_1.notificationInventoryResourceTypeFilters),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "inventoryResourceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory attention level filter.',
        enum: notification_contract_constants_1.notificationInventoryAlertAttentionLevelFilters,
        example: 'LOW_STOCK',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(notification_contract_constants_1.notificationInventoryAlertAttentionLevelFilters),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "inventoryAttentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch filter for inventory alert notifications.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "branchId", void 0);
//# sourceMappingURL=list-notifications-query.dto.js.map