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
exports.NotificationCenterPageEntity = void 0;
exports.buildNotificationCenterPage = buildNotificationCenterPage;
const swagger_1 = require("@nestjs/swagger");
const notification_center_entity_1 = require("./notification-center.entity");
class NotificationCenterPageEntity {
}
exports.NotificationCenterPageEntity = NotificationCenterPageEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'notification_20',
        nullable: true,
    }),
    __metadata("design:type", Object)
], NotificationCenterPageEntity.prototype, "nextCursor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], NotificationCenterPageEntity.prototype, "hasMore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'INVENTORY_OPEN',
        nullable: true,
    }),
    __metadata("design:type", Object)
], NotificationCenterPageEntity.prototype, "appliedPreset", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T08:00:00.000Z' }),
    __metadata("design:type", String)
], NotificationCenterPageEntity.prototype, "generatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    __metadata("design:type", Number)
], NotificationCenterPageEntity.prototype, "cacheTtlSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15 }),
    __metadata("design:type", Number)
], NotificationCenterPageEntity.prototype, "suggestedPollIntervalSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: notification_center_entity_1.NotificationCenterEntity, isArray: true }),
    __metadata("design:type", Array)
], NotificationCenterPageEntity.prototype, "notifications", void 0);
function buildNotificationCenterPage(input) {
    return {
        nextCursor: input.nextCursor,
        hasMore: input.hasMore,
        appliedPreset: input.appliedPreset,
        generatedAt: input.generatedAt,
        cacheTtlSeconds: input.cacheTtlSeconds,
        suggestedPollIntervalSeconds: input.suggestedPollIntervalSeconds,
        notifications: input.notifications,
    };
}
//# sourceMappingURL=notification-center-page.entity.js.map