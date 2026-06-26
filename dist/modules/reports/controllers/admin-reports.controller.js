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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReportsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const admin_inventory_alert_overview_report_dto_1 = require("../dto/admin-inventory-alert-overview-report.dto");
const admin_inventory_alert_trends_report_dto_1 = require("../dto/admin-inventory-alert-trends-report.dto");
const list_admin_inventory_alert_report_query_dto_1 = require("../dto/list-admin-inventory-alert-report-query.dto");
const admin_reports_service_1 = require("../services/admin-reports.service");
let AdminReportsController = class AdminReportsController {
    constructor(adminReportsService) {
        this.adminReportsService = adminReportsService;
    }
    overview(currentUser, query) {
        return this.adminReportsService.getInventoryAlertOverview(currentUser, query);
    }
    trends(currentUser, query) {
        return this.adminReportsService.getInventoryAlertTrends(currentUser, query);
    }
};
exports.AdminReportsController = AdminReportsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminInventoryAlertOverviewReport',
        summary: 'Get admin inventory alert overview analytics',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns aggregated inventory alert, follow-up, and push delivery observability counts for the requested analytics window.',
        type: admin_inventory_alert_overview_report_dto_1.AdminInventoryAlertOverviewReportDto,
    }),
    (0, common_1.Get)('inventory-alerts/overview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_admin_inventory_alert_report_query_dto_1.ListAdminInventoryAlertReportQueryDto]),
    __metadata("design:returntype", void 0)
], AdminReportsController.prototype, "overview", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminInventoryAlertTrendsReport',
        summary: 'Get admin inventory alert trend analytics',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns day-by-day inventory alert creation and lifecycle event counts for the requested analytics window.',
        type: admin_inventory_alert_trends_report_dto_1.AdminInventoryAlertTrendsReportDto,
    }),
    (0, common_1.Get)('inventory-alerts/trends'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_admin_inventory_alert_report_query_dto_1.ListAdminInventoryAlertReportQueryDto]),
    __metadata("design:returntype", void 0)
], AdminReportsController.prototype, "trends", null);
exports.AdminReportsController = AdminReportsController = __decorate([
    (0, swagger_1.ApiTags)('admin-reports'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/reports'),
    __metadata("design:paramtypes", [admin_reports_service_1.AdminReportsService])
], AdminReportsController);
//# sourceMappingURL=admin-reports.controller.js.map