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
exports.BulkAcknowledgeInventoryAlertsResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const admin_inventory_alert_dto_1 = require("./admin-inventory-alert.dto");
class BulkAcknowledgeInventoryAlertsResponseDto {
}
exports.BulkAcknowledgeInventoryAlertsResponseDto = BulkAcknowledgeInventoryAlertsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts acknowledged by this bulk request.',
        example: 2,
    }),
    __metadata("design:type", Number)
], BulkAcknowledgeInventoryAlertsResponseDto.prototype, "acknowledgedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Resolved inventory alerts after applying acknowledgement state.',
        type: admin_inventory_alert_dto_1.AdminInventoryAlertDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], BulkAcknowledgeInventoryAlertsResponseDto.prototype, "alerts", void 0);
//# sourceMappingURL=bulk-acknowledge-inventory-alerts-response.dto.js.map