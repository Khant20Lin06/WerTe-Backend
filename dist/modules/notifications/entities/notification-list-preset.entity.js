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
exports.NotificationListPresetEntity = exports.NotificationListPresetQueryEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class NotificationListPresetQueryEntity {
}
exports.NotificationListPresetQueryEntity = NotificationListPresetQueryEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INVENTORY_OPEN' }),
    __metadata("design:type", String)
], NotificationListPresetQueryEntity.prototype, "preset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "unreadOnly", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SYSTEM_ALERT', nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ATTENTION', nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "inventoryAlertKind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OPEN', nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "inventoryAlertStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MENU_ITEM', nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "inventoryResourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LOW_STOCK', nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "inventoryAttentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationListPresetQueryEntity.prototype, "branchId", void 0);
class NotificationListPresetEntity {
}
exports.NotificationListPresetEntity = NotificationListPresetEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INVENTORY_OPEN' }),
    __metadata("design:type", String)
], NotificationListPresetEntity.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Open inventory alerts' }),
    __metadata("design:type", String)
], NotificationListPresetEntity.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], NotificationListPresetEntity.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], NotificationListPresetEntity.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], NotificationListPresetEntity.prototype, "cacheTtlSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], NotificationListPresetEntity.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationListPresetQueryEntity }),
    __metadata("design:type", NotificationListPresetQueryEntity)
], NotificationListPresetEntity.prototype, "query", void 0);
//# sourceMappingURL=notification-list-preset.entity.js.map