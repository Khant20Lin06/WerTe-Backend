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
exports.BulkMarkInventoryAlertsReadResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const notification_center_entity_1 = require("../entities/notification-center.entity");
class BulkMarkInventoryAlertsReadResponseDto {
}
exports.BulkMarkInventoryAlertsReadResponseDto = BulkMarkInventoryAlertsReadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of inventory alert notifications newly marked as read by this bulk request.',
        example: 2,
    }),
    __metadata("design:type", Number)
], BulkMarkInventoryAlertsReadResponseDto.prototype, "markedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved inventory alert notification snapshots after applying read state.',
        type: notification_center_entity_1.NotificationCenterEntity,
        isArray: true,
    }),
    __metadata("design:type", Array)
], BulkMarkInventoryAlertsReadResponseDto.prototype, "notifications", void 0);
//# sourceMappingURL=bulk-mark-inventory-alerts-read-response.dto.js.map