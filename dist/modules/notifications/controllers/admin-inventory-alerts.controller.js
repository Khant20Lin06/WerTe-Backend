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
exports.AdminInventoryAlertsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const admin_inventory_alert_dto_1 = require("../dto/admin-inventory-alert.dto");
const acknowledge_inventory_alert_dto_1 = require("../dto/acknowledge-inventory-alert.dto");
const bulk_acknowledge_inventory_alerts_dto_1 = require("../dto/bulk-acknowledge-inventory-alerts.dto");
const bulk_acknowledge_inventory_alerts_response_dto_1 = require("../dto/bulk-acknowledge-inventory-alerts-response.dto");
const bulk_dismiss_inventory_alerts_dto_1 = require("../dto/bulk-dismiss-inventory-alerts.dto");
const bulk_dismiss_inventory_alerts_response_dto_1 = require("../dto/bulk-dismiss-inventory-alerts-response.dto");
const list_admin_inventory_alerts_query_dto_1 = require("../dto/list-admin-inventory-alerts-query.dto");
const admin_inventory_alerts_service_1 = require("../services/admin-inventory-alerts.service");
let AdminInventoryAlertsController = class AdminInventoryAlertsController {
    constructor(adminInventoryAlertsService) {
        this.adminInventoryAlertsService = adminInventoryAlertsService;
    }
    list(currentUser, query) {
        return this.adminInventoryAlertsService.listInventoryAlerts(currentUser, query);
    }
    bulkAcknowledge(currentUser, payload) {
        return this.adminInventoryAlertsService.bulkAcknowledgeInventoryAlerts(currentUser, payload);
    }
    bulkDismiss(currentUser, payload) {
        return this.adminInventoryAlertsService.bulkDismissInventoryAlerts(currentUser, payload);
    }
    acknowledge(currentUser, notificationId, payload) {
        return this.adminInventoryAlertsService.acknowledgeInventoryAlert(currentUser, notificationId, payload);
    }
    resolve(currentUser, notificationId, payload) {
        return this.adminInventoryAlertsService.resolveInventoryAlert(currentUser, notificationId, payload);
    }
};
exports.AdminInventoryAlertsController = AdminInventoryAlertsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminInventoryAlerts',
        summary: 'List admin-visible merchant inventory alerts',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns merchant inventory system alerts with acknowledgement state for the admin control plane.',
        type: admin_inventory_alert_dto_1.AdminInventoryAlertDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_admin_inventory_alerts_query_dto_1.ListAdminInventoryAlertsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminInventoryAlertsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'bulkAcknowledgeAdminInventoryAlerts',
        summary: 'Bulk acknowledge merchant inventory alerts',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the resolved inventory alerts and the number of alerts acknowledged by the bulk request.',
        type: bulk_acknowledge_inventory_alerts_response_dto_1.BulkAcknowledgeInventoryAlertsResponseDto,
    }),
    (0, common_1.Post)('bulk-acknowledge'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        bulk_acknowledge_inventory_alerts_dto_1.BulkAcknowledgeInventoryAlertsDto]),
    __metadata("design:returntype", void 0)
], AdminInventoryAlertsController.prototype, "bulkAcknowledge", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'bulkDismissAdminInventoryAlerts',
        summary: 'Bulk dismiss merchant inventory alerts',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the resolved inventory alerts and the number of alerts dismissed by the bulk request.',
        type: bulk_dismiss_inventory_alerts_response_dto_1.BulkDismissInventoryAlertsResponseDto,
    }),
    (0, common_1.Post)('bulk-dismiss'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        bulk_dismiss_inventory_alerts_dto_1.BulkDismissInventoryAlertsDto]),
    __metadata("design:returntype", void 0)
], AdminInventoryAlertsController.prototype, "bulkDismiss", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'acknowledgeAdminInventoryAlert',
        summary: 'Acknowledge a merchant inventory alert',
    }),
    (0, swagger_1.ApiParam)({
        name: 'notificationId',
        description: 'Inventory alert notification identifier.',
        example: 'notification_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the inventory alert with its latest acknowledgement snapshot.',
        type: admin_inventory_alert_dto_1.AdminInventoryAlertDto,
    }),
    (0, common_1.Post)(':notificationId/acknowledge'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('notificationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, acknowledge_inventory_alert_dto_1.AcknowledgeInventoryAlertDto]),
    __metadata("design:returntype", void 0)
], AdminInventoryAlertsController.prototype, "acknowledge", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'resolveAdminInventoryAlert',
        summary: 'Resolve a merchant inventory alert',
    }),
    (0, swagger_1.ApiParam)({
        name: 'notificationId',
        description: 'Inventory alert notification identifier.',
        example: 'notification_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the inventory alert with its latest lifecycle snapshot.',
        type: admin_inventory_alert_dto_1.AdminInventoryAlertDto,
    }),
    (0, common_1.Post)(':notificationId/resolve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('notificationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, acknowledge_inventory_alert_dto_1.AcknowledgeInventoryAlertDto]),
    __metadata("design:returntype", void 0)
], AdminInventoryAlertsController.prototype, "resolve", null);
exports.AdminInventoryAlertsController = AdminInventoryAlertsController = __decorate([
    (0, swagger_1.ApiTags)('admin-inventory-alerts'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/inventory-alerts'),
    __metadata("design:paramtypes", [admin_inventory_alerts_service_1.AdminInventoryAlertsService])
], AdminInventoryAlertsController);
//# sourceMappingURL=admin-inventory-alerts.controller.js.map