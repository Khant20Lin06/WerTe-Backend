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
exports.AdminInventoryAlertOverviewReportDto = exports.AdminInventoryAlertReportBranchSummaryDto = exports.AdminInventoryAlertReportDeliveryCountsDto = exports.AdminInventoryAlertReportFollowUpCountsDto = exports.AdminInventoryAlertReportResourceTypeCountsDto = exports.AdminInventoryAlertReportAttentionLevelCountsDto = exports.AdminInventoryAlertReportStatusCountsDto = exports.AdminInventoryAlertReportKindCountsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AdminInventoryAlertReportKindCountsDto {
}
exports.AdminInventoryAlertReportKindCountsDto = AdminInventoryAlertReportKindCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of shortage-style attention alerts in the report window.',
        example: 12,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportKindCountsDto.prototype, "attentionAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of compensation alerts generated from inventory restoration events.',
        example: 4,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportKindCountsDto.prototype, "compensationAlertsCount", void 0);
class AdminInventoryAlertReportStatusCountsDto {
}
exports.AdminInventoryAlertReportStatusCountsDto = AdminInventoryAlertReportStatusCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts that are still open.',
        example: 6,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportStatusCountsDto.prototype, "openAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts that were acknowledged by admins.',
        example: 2,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportStatusCountsDto.prototype, "acknowledgedAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts resolved by admins or system lifecycle rules.',
        example: 5,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportStatusCountsDto.prototype, "resolvedAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts dismissed by admins.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportStatusCountsDto.prototype, "dismissedAlertsCount", void 0);
class AdminInventoryAlertReportAttentionLevelCountsDto {
}
exports.AdminInventoryAlertReportAttentionLevelCountsDto = AdminInventoryAlertReportAttentionLevelCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of low-stock attention alerts in the report window.',
        example: 8,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportAttentionLevelCountsDto.prototype, "lowStockAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of out-of-stock attention alerts in the report window.',
        example: 4,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportAttentionLevelCountsDto.prototype, "outOfStockAlertsCount", void 0);
class AdminInventoryAlertReportResourceTypeCountsDto {
}
exports.AdminInventoryAlertReportResourceTypeCountsDto = AdminInventoryAlertReportResourceTypeCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts attached to menu items.',
        example: 10,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportResourceTypeCountsDto.prototype, "menuItemAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of alerts attached to item options.',
        example: 6,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportResourceTypeCountsDto.prototype, "itemOptionAlertsCount", void 0);
class AdminInventoryAlertReportFollowUpCountsDto {
}
exports.AdminInventoryAlertReportFollowUpCountsDto = AdminInventoryAlertReportFollowUpCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of reminder follow-up audit events in the report window.',
        example: 3,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportFollowUpCountsDto.prototype, "reminderCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of escalation follow-up audit events in the report window.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportFollowUpCountsDto.prototype, "escalationCount", void 0);
class AdminInventoryAlertReportDeliveryCountsDto {
}
exports.AdminInventoryAlertReportDeliveryCountsDto = AdminInventoryAlertReportDeliveryCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of pending push delivery attempts in the report window.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportDeliveryCountsDto.prototype, "pushPendingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of queued push delivery attempts in the report window.',
        example: 2,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportDeliveryCountsDto.prototype, "pushQueuedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of sent push delivery attempts in the report window.',
        example: 9,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportDeliveryCountsDto.prototype, "pushSentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of delivered push delivery attempts in the report window.',
        example: 7,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportDeliveryCountsDto.prototype, "pushDeliveredCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of failed push delivery attempts in the report window.',
        example: 2,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportDeliveryCountsDto.prototype, "pushFailedCount", void 0);
class AdminInventoryAlertReportBranchSummaryDto {
}
exports.AdminInventoryAlertReportBranchSummaryDto = AdminInventoryAlertReportBranchSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch identifier derived from alert metadata.',
        example: 'branch_1',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertReportBranchSummaryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch name derived from alert metadata.',
        example: 'Downtown Branch',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AdminInventoryAlertReportBranchSummaryDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of alerts in the report window for this branch.',
        example: 8,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportBranchSummaryDto.prototype, "totalAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of currently open or acknowledged alerts for this branch.',
        example: 3,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportBranchSummaryDto.prototype, "openLifecycleAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of escalation follow-up events for this branch.',
        example: 1,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertReportBranchSummaryDto.prototype, "escalatedAlertsCount", void 0);
class AdminInventoryAlertOverviewReportDto {
}
exports.AdminInventoryAlertOverviewReportDto = AdminInventoryAlertOverviewReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the analytics snapshot was generated.',
        example: '2026-05-02T12:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertOverviewReportDto.prototype, "generatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inclusive UTC start of the analytics window.',
        example: '2026-04-26T00:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertOverviewReportDto.prototype, "windowStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current UTC time used as the report window end.',
        example: '2026-05-02T12:00:00.000Z',
    }),
    __metadata("design:type", String)
], AdminInventoryAlertOverviewReportDto.prototype, "windowEndedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of trailing UTC days included in the snapshot.',
        example: 7,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertOverviewReportDto.prototype, "periodDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of inventory alerts in the analytics window.',
        example: 16,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertOverviewReportDto.prototype, "totalAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of inventory alerts the merchant has not marked as read yet.',
        example: 5,
    }),
    __metadata("design:type", Number)
], AdminInventoryAlertOverviewReportDto.prototype, "unreadMerchantAlertsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Counts split by alert kind.',
        type: AdminInventoryAlertReportKindCountsDto,
    }),
    __metadata("design:type", AdminInventoryAlertReportKindCountsDto)
], AdminInventoryAlertOverviewReportDto.prototype, "kindCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Counts split by current lifecycle status.',
        type: AdminInventoryAlertReportStatusCountsDto,
    }),
    __metadata("design:type", AdminInventoryAlertReportStatusCountsDto)
], AdminInventoryAlertOverviewReportDto.prototype, "statusCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Counts split by shortage attention level.',
        type: AdminInventoryAlertReportAttentionLevelCountsDto,
    }),
    __metadata("design:type", AdminInventoryAlertReportAttentionLevelCountsDto)
], AdminInventoryAlertOverviewReportDto.prototype, "attentionLevelCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Counts split by alert resource type.',
        type: AdminInventoryAlertReportResourceTypeCountsDto,
    }),
    __metadata("design:type", AdminInventoryAlertReportResourceTypeCountsDto)
], AdminInventoryAlertOverviewReportDto.prototype, "resourceTypeCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Counts split by follow-up action type.',
        type: AdminInventoryAlertReportFollowUpCountsDto,
    }),
    __metadata("design:type", AdminInventoryAlertReportFollowUpCountsDto)
], AdminInventoryAlertOverviewReportDto.prototype, "followUpCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Push delivery attempt status counts for the same alert window.',
        type: AdminInventoryAlertReportDeliveryCountsDto,
    }),
    __metadata("design:type", AdminInventoryAlertReportDeliveryCountsDto)
], AdminInventoryAlertOverviewReportDto.prototype, "deliveryCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Top branches by alert volume in the analytics window.',
        type: AdminInventoryAlertReportBranchSummaryDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], AdminInventoryAlertOverviewReportDto.prototype, "topBranches", void 0);
//# sourceMappingURL=admin-inventory-alert-overview-report.dto.js.map