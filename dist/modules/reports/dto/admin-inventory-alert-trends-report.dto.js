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
exports.AdminInventoryAlertTrendsReportDto = exports.AdminInventoryAlertTrendBucketDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AdminInventoryAlertTrendBucketDto {
}
exports.AdminInventoryAlertTrendBucketDto = AdminInventoryAlertTrendBucketDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UTC calendar date bucket in YYYY-MM-DD format.',
        example: '2026-05-02',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertTrendBucketDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of inventory alerts created on this UTC date.',
        example: 4,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "createdAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of attention alerts created on this UTC date.',
        example: 3,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "attentionAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of compensation alerts created on this UTC date.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "compensationAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts created on this date that remain unread by merchants.',
        example: 2,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "unreadMerchantAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of acknowledgement lifecycle events recorded on this UTC date.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "acknowledgedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of resolution lifecycle events recorded on this UTC date.',
        example: 2,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "resolvedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of dismissal lifecycle events recorded on this UTC date.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "dismissedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of reminder follow-up events recorded on this UTC date.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "reminderCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of escalation follow-up events recorded on this UTC date.',
        example: 0,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendBucketDto.prototype, "escalationCount", void 0);
class AdminInventoryAlertTrendsReportDto {
}
exports.AdminInventoryAlertTrendsReportDto = AdminInventoryAlertTrendsReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the trend report was generated.',
        example: '2026-05-02T12:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertTrendsReportDto.prototype, "generatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inclusive UTC start of the trend window.',
        example: '2026-04-26T00:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertTrendsReportDto.prototype, "windowStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current UTC time used as the trend window end.',
        example: '2026-05-02T12:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertTrendsReportDto.prototype, "windowEndedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of trailing UTC days included in the trend window.',
        example: 7,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertTrendsReportDto.prototype, "periodDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UTC date buckets covering the requested analytics window.',
        type: AdminInventoryAlertTrendBucketDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], AdminInventoryAlertTrendsReportDto.prototype, "buckets", void 0);
//# sourceMappingURL=admin-inventory-alert-trends-report.dto.js.map