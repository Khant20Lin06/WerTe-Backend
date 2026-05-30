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
exports.AuditReadService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const audit_service_1 = require("./audit.service");
let AuditReadService = class AuditReadService {
    constructor(auditService) {
        this.auditService = auditService;
    }
    listAdminAuditLogs(currentUser, query) {
        this.assertCanReadAuditLogs(currentUser);
        return this.auditService.listRecent(query.limit ?? 50);
    }
    listAdminOrderAuditLogs(currentUser, orderId, query) {
        this.assertCanReadAuditLogs(currentUser);
        return this.auditService.listByOrderId(orderId, query.limit ?? 50);
    }
    listAdminResourceAuditLogs(currentUser, resourceType, resourceId, query) {
        this.assertCanReadAuditLogs(currentUser);
        return this.auditService.listByResource(resourceType, resourceId, query.limit ?? 50);
    }
    assertCanReadAuditLogs(currentUser) {
        if (currentUser.role !== client_1.UserRole.ADMIN) {
            throw new app_exception_1.AppException('You are not allowed to read audit logs.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
    }
};
exports.AuditReadService = AuditReadService;
exports.AuditReadService = AuditReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditReadService);
//# sourceMappingURL=audit-read.service.js.map