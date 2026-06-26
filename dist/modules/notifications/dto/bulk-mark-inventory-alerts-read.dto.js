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
exports.BulkMarkInventoryAlertsReadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const inventoryAlertKindFilters = ['ALL', 'ATTENTION', 'COMPENSATION'];
const inventoryAlertStatusFilters = [
    'ALL',
    'OPEN',
    'ACKNOWLEDGED',
    'RESOLVED',
    'DISMISSED',
];
const inventoryResourceTypeFilters = ['ALL', 'MENU_ITEM', 'ITEM_OPTION'];
const inventoryAttentionLevelFilters = [
    'ALL',
    'LOW_STOCK',
    'OUT_OF_STOCK',
];
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
class BulkMarkInventoryAlertsReadDto {
}
exports.BulkMarkInventoryAlertsReadDto = BulkMarkInventoryAlertsReadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific inventory alert notification identifiers to mark as read.',
        example: ['notification_1', 'notification_2'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkMarkInventoryAlertsReadDto.prototype, "notificationIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'When true, marks all unread inventory alerts matching the filters below.',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => transformOptionalBoolean(value)),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkMarkInventoryAlertsReadDto.prototype, "markAllMatching", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum number of unread filtered inventory alerts to mark when markAllMatching is enabled.',
        example: 100,
        minimum: 1,
        maximum: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], BulkMarkInventoryAlertsReadDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional keyword filter across inventory alert title, body, branch, and item labels.',
        example: 'mohinga',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkMarkInventoryAlertsReadDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory alert kind filter.',
        enum: inventoryAlertKindFilters,
        example: 'ATTENTION',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(inventoryAlertKindFilters),
    __metadata("design:type", String)
], BulkMarkInventoryAlertsReadDto.prototype, "inventoryAlertKind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory alert status filter.',
        enum: inventoryAlertStatusFilters,
        example: 'OPEN',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(inventoryAlertStatusFilters),
    __metadata("design:type", String)
], BulkMarkInventoryAlertsReadDto.prototype, "inventoryAlertStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory resource type filter.',
        enum: inventoryResourceTypeFilters,
        example: 'MENU_ITEM',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(inventoryResourceTypeFilters),
    __metadata("design:type", String)
], BulkMarkInventoryAlertsReadDto.prototype, "inventoryResourceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional inventory attention level filter.',
        enum: inventoryAttentionLevelFilters,
        example: 'LOW_STOCK',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(inventoryAttentionLevelFilters),
    __metadata("design:type", String)
], BulkMarkInventoryAlertsReadDto.prototype, "inventoryAttentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch filter for inventory alert notifications.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkMarkInventoryAlertsReadDto.prototype, "branchId", void 0);
//# sourceMappingURL=bulk-mark-inventory-alerts-read.dto.js.map