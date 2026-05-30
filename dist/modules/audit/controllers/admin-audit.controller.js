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
exports.AdminAuditController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const list_audit_logs_query_dto_1 = require("../dto/list-audit-logs-query.dto");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const audit_read_service_1 = require("../services/audit-read.service");
let AdminAuditController = class AdminAuditController {
    constructor(auditReadService) {
        this.auditReadService = auditReadService;
    }
    list(currentUser, query) {
        return this.auditReadService.listAdminAuditLogs(currentUser, query);
    }
    listOrderLogs(currentUser, orderId, query) {
        return this.auditReadService.listAdminOrderAuditLogs(currentUser, orderId, query);
    }
    listResourceLogs(currentUser, resourceType, resourceId, query) {
        return this.auditReadService.listAdminResourceAuditLogs(currentUser, resourceType, resourceId, query);
    }
};
exports.AdminAuditController = AdminAuditController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminAuditLogs',
        summary: 'List recent audit log records for the admin control plane',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns recent audit logs visible to administrators.',
        type: audit_log_entity_1.AuditLogEntity,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_audit_logs_query_dto_1.ListAuditLogsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminAuditController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminOrderAuditLogs',
        summary: 'List audit logs for a specific order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns audit logs related to the requested order.',
        type: audit_log_entity_1.AuditLogEntity,
        isArray: true,
    }),
    (0, common_1.Get)('orders/:orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, list_audit_logs_query_dto_1.ListAuditLogsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminAuditController.prototype, "listOrderLogs", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminResourceAuditLogs',
        summary: 'List audit logs for a specific resource',
    }),
    (0, swagger_1.ApiParam)({
        name: 'resourceType',
        description: 'Resource type recorded in the audit log.',
        enum: client_1.AuditResourceType,
    }),
    (0, swagger_1.ApiParam)({
        name: 'resourceId',
        description: 'Resource identifier recorded in the audit log.',
        example: 'message_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns audit logs related to the requested resource.',
        type: audit_log_entity_1.AuditLogEntity,
        isArray: true,
    }),
    (0, common_1.Get)('resources/:resourceType/:resourceId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('resourceType')),
    __param(2, (0, common_1.Param)('resourceId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, list_audit_logs_query_dto_1.ListAuditLogsQueryDto]),
    __metadata("design:returntype", void 0)
], AdminAuditController.prototype, "listResourceLogs", null);
exports.AdminAuditController = AdminAuditController = __decorate([
    (0, swagger_1.ApiTags)('admin-audit'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/audit'),
    __metadata("design:paramtypes", [audit_read_service_1.AuditReadService])
], AdminAuditController);
//# sourceMappingURL=admin-audit.controller.js.map