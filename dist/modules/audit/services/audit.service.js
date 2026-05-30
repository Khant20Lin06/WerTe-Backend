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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const audit_repository_1 = require("../repositories/audit.repository");
let AuditService = class AuditService {
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
    }
    async logAction(payload) {
        const auditLog = await this.auditRepository.create(payload);
        return (0, audit_log_entity_1.buildAuditLogEntity)(auditLog);
    }
    async listRecent(limit = 50) {
        const logs = await this.auditRepository.listRecent(limit);
        return logs.map((log) => (0, audit_log_entity_1.buildAuditLogEntity)(log));
    }
    async listByResource(resourceType, resourceId, limit = 50) {
        const logs = await this.auditRepository.findByResource(resourceType, resourceId, limit);
        return logs.map((log) => (0, audit_log_entity_1.buildAuditLogEntity)(log));
    }
    async listByOrderId(orderId, limit = 50) {
        const logs = await this.auditRepository.findByOrderId(orderId, limit);
        return logs.map((log) => (0, audit_log_entity_1.buildAuditLogEntity)(log));
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_repository_1.AuditRepository])
], AuditService);
//# sourceMappingURL=audit.service.js.map