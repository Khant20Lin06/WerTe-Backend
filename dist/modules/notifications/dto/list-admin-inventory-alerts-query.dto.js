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
exports.ListAdminInventoryAlertsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const admin_inventory_alert_dto_1 = require("./admin-inventory-alert.dto");
class ListAdminInventoryAlertsQueryDto {
}
exports.ListAdminInventoryAlertsQueryDto = ListAdminInventoryAlertsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of admin inventory alerts to return.',
        example: 20,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListAdminInventoryAlertsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch filter for inventory alerts.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Administrative acknowledgement status filter.',
        enum: [...Object.values(admin_inventory_alert_dto_1.AdminInventoryAlertStatus), 'ALL'],
        example: admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)({
        ...admin_inventory_alert_dto_1.AdminInventoryAlertStatus,
        ALL: 'ALL',
    }),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional merchant user filter for inventory alerts.',
        example: 'usr_merchant_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "merchantUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Alert kind filter.',
        enum: [...Object.values(admin_inventory_alert_dto_1.AdminInventoryAlertKind), 'ALL'],
        example: admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)({
        ...admin_inventory_alert_dto_1.AdminInventoryAlertKind,
        ALL: 'ALL',
    }),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "alertKind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Inventory resource type filter.',
        enum: ['MENU_ITEM', 'ITEM_OPTION', 'ALL'],
        example: 'MENU_ITEM',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)({
        MENU_ITEM: 'MENU_ITEM',
        ITEM_OPTION: 'ITEM_OPTION',
        ALL: 'ALL',
    }),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "resourceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Attention level filter for shortage alerts.',
        enum: ['LOW_STOCK', 'OUT_OF_STOCK', 'ALL'],
        example: 'LOW_STOCK',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)({
        LOW_STOCK: 'LOW_STOCK',
        OUT_OF_STOCK: 'OUT_OF_STOCK',
        ALL: 'ALL',
    }),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "attentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Case-insensitive keyword search across alert title, resource label, branch, order code, and merchant phone.',
        example: 'mohinga',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminInventoryAlertsQueryDto.prototype, "keyword", void 0);
//# sourceMappingURL=list-admin-inventory-alerts-query.dto.js.map