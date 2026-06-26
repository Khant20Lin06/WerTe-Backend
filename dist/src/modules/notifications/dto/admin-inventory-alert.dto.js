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
exports.AdminInventoryAlertDto = exports.AdminInventoryAlertAcknowledgerDto = exports.AdminInventoryAlertKind = exports.AdminInventoryAlertStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
var AdminInventoryAlertStatus;
(function (AdminInventoryAlertStatus) {
    AdminInventoryAlertStatus["OPEN"] = "OPEN";
    AdminInventoryAlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AdminInventoryAlertStatus["RESOLVED"] = "RESOLVED";
    AdminInventoryAlertStatus["DISMISSED"] = "DISMISSED";
})(AdminInventoryAlertStatus || (exports.AdminInventoryAlertStatus = AdminInventoryAlertStatus = {}));
var AdminInventoryAlertKind;
(function (AdminInventoryAlertKind) {
    AdminInventoryAlertKind["ATTENTION"] = "ATTENTION";
    AdminInventoryAlertKind["COMPENSATION"] = "COMPENSATION";
})(AdminInventoryAlertKind || (exports.AdminInventoryAlertKind = AdminInventoryAlertKind = {}));
class AdminInventoryAlertAcknowledgerDto {
}
exports.AdminInventoryAlertAcknowledgerDto = AdminInventoryAlertAcknowledgerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Administrator user identifier.',
        example: 'usr_admin_1',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertAcknowledgerDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Administrator role that acknowledged the alert.',
        enum: client_1.UserRole,
    }),
    __metadata("design:type", String)
], AdminInventoryAlertAcknowledgerDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Administrator phone number.',
        example: '099999999',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertAcknowledgerDto.prototype, "phone", void 0);
class AdminInventoryAlertDto {
}
exports.AdminInventoryAlertDto = AdminInventoryAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification identifier for the inventory alert.',
        example: 'notification_1',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "notificationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification type.',
        enum: client_1.NotificationType,
        example: client_1.NotificationType.SYSTEM_ALERT,
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alert title shown to the merchant.',
        example: 'Low stock: Mohinga',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alert body shown to the merchant.',
        example: 'Mohinga is now low in Downtown Branch with 2 left (threshold 3).',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Merchant navigation path attached to the alert.',
        example: '/merchant/branches/branch_1/inventory/overview',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "navigationPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant user identifier that received the alert.',
        example: 'usr_merchant_1',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "merchantUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant role attached to the alert notification.',
        enum: client_1.UserRole,
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "merchantRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant phone number.',
        example: '0999999999',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "merchantPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch identifier derived from the alert metadata.',
        example: 'branch_1',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch display name derived from the alert metadata.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inventory alert kind derived from the alert metadata.',
        enum: AdminInventoryAlertKind,
        example: AdminInventoryAlertKind.ATTENTION,
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "alertKind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inventory resource type attached to the alert.',
        example: 'MENU_ITEM',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "resourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inventory resource identifier attached to the alert.',
        example: 'item_1',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "resourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inventory resource label attached to the alert.',
        example: 'Mohinga',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "resourceLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent menu item name when the alert is about an item option.',
        example: 'Mohinga',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "menuItemName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inventory attention level attached to shortage alerts. Null for compensation alerts.',
        enum: ['LOW_STOCK', 'OUT_OF_STOCK'],
        example: 'LOW_STOCK',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "attentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current stock quantity included with the alert.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Configured low-stock threshold included with the alert.',
        example: 3,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Restored quantity included with compensation alerts. Null for shortage alerts.',
        example: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "restoredQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Order identifier attached to a compensation alert when available.',
        example: 'order_1',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Order code attached to a compensation alert when available.',
        example: 'ORD-00000001',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "orderCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason code that triggered a compensation alert when available.',
        example: 'payment_failed',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp when the merchant marked the notification as read.',
        example: '2026-05-01T10:05:00.000Z',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "merchantReadAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Administrative acknowledgement status for the alert.',
        enum: AdminInventoryAlertStatus,
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional acknowledgement note recorded by the administrator.',
        example: 'Ops team contacted merchant for a restock update.',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "acknowledgementNote", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp when the alert was acknowledged by an administrator.',
        example: '2026-05-01T10:15:00.000Z',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Administrator summary for the acknowledgement actor.',
        type: AdminInventoryAlertAcknowledgerDto,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional lifecycle note recorded for the current alert status.',
        example: 'Restock confirmed; closing alert.',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "statusNote", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp when the current alert status was last set.',
        example: '2026-05-01T10:20:00.000Z',
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "statusChangedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Administrator summary for the actor who set the current alert status.',
        type: AdminInventoryAlertAcknowledgerDto,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertDto.prototype, "statusChangedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alert creation timestamp.',
        example: '2026-05-01T10:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertDto.prototype, "createdAt", void 0);
//# sourceMappingURL=admin-inventory-alert.dto.js.map