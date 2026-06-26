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
exports.ListAdminInventoryAlertReportQueryDto = exports.adminInventoryAlertReportMaxDays = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.adminInventoryAlertReportMaxDays = 30;
class ListAdminInventoryAlertReportQueryDto {
}
exports.ListAdminInventoryAlertReportQueryDto = ListAdminInventoryAlertReportQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of trailing UTC days to include in the analytics window.',
        example: 7,
        minimum: 1,
        maximum: exports.adminInventoryAlertReportMaxDays,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(exports.adminInventoryAlertReportMaxDays),
    __metadata("design:type", Number)
], ListAdminInventoryAlertReportQueryDto.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch filter for inventory alert analytics.',
        example: 'branch_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminInventoryAlertReportQueryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional merchant user identifier filter for inventory alert analytics.',
        example: 'usr_merchant_1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminInventoryAlertReportQueryDto.prototype, "merchantUserId", void 0);
//# sourceMappingURL=list-admin-inventory-alert-report-query.dto.js.map