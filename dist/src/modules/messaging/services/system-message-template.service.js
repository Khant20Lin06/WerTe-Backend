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
exports.SystemMessageTemplateService = void 0;
const common_1 = require("@nestjs/common");
const system_message_template_repository_1 = require("../repositories/system-message-template.repository");
const defaultTemplateBodies = {
    ORDER_PLACED: 'Order {{orderCode}} was placed and is waiting for merchant confirmation.',
    ORDER_ACCEPTED: '{{merchantName}} accepted the order and will start preparing it soon.',
    ORDER_REJECTED: '{{merchantName}} rejected the order. {{note}}',
    ORDER_PREPARING: '{{merchantName}} is preparing the order now.',
    ORDER_READY: 'Order {{orderCode}} is ready for rider pickup.',
    RIDER_ASSIGNED: '{{riderName}} was assigned to deliver the order.',
    RIDER_ACCEPTED: '{{riderName}} accepted the delivery request.',
    RIDER_REJECTED_ASSIGNMENT: '{{riderName}} rejected the delivery request. The order will be reassigned.',
    ORDER_PICKED_UP: '{{riderName}} picked up the order from {{branchName}}.',
    ORDER_ON_THE_WAY: '{{riderName}} is on the way with the order.',
    ORDER_DELIVERED: '{{riderName}} delivered the order successfully.',
    ORDER_CANCELLED: 'Order {{orderCode}} was cancelled. {{note}}',
    FAILED_DELIVERY: 'Delivery for order {{orderCode}} failed. {{reasonCode}} {{note}}',
    MERCHANT_HANDOFF_CONFIRMED: '{{merchantName}} handed the order over to {{riderName}}.',
    DELIVERY_PROOF_SUBMITTED: '{{riderName}} submitted delivery proof for the order.',
    ADMIN_INTERVENTION: 'Operations updated the order flow. {{reasonCode}} {{note}}',
    PAYMENT_PENDING: 'Payment for order {{orderCode}} is pending. {{note}}',
    PAYMENT_SUCCEEDED: 'Payment for order {{orderCode}} was completed successfully.',
    PAYMENT_FAILED: 'Payment for order {{orderCode}} failed. {{reasonCode}} {{note}}',
    PAYMENT_CANCELLED: 'Payment for order {{orderCode}} was cancelled. {{note}}',
    REFUND_REQUESTED: 'A refund was requested for order {{orderCode}}. {{reasonCode}} {{note}}',
    REFUND_SUCCEEDED: 'Refund for order {{orderCode}} was completed successfully.',
    REFUND_FAILED: 'Refund for order {{orderCode}} failed. {{reasonCode}} {{note}}',
};
let SystemMessageTemplateService = class SystemMessageTemplateService {
    constructor(templateRepository) {
        this.templateRepository = templateRepository;
    }
    saveTemplateOverride(payload) {
        return this.templateRepository.upsertTemplate(payload);
    }
    async render(code, variables) {
        const template = await this.templateRepository.findActiveByCode(code);
        const bodyTemplate = template?.bodyTemplate ?? defaultTemplateBodies[code] ?? '';
        return this.interpolate(bodyTemplate, variables).replace(/\s+/g, ' ').trim();
    }
    interpolate(template, variables) {
        return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => {
            const value = variables[key];
            return value == null ? '' : value;
        });
    }
};
exports.SystemMessageTemplateService = SystemMessageTemplateService;
exports.SystemMessageTemplateService = SystemMessageTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [system_message_template_repository_1.SystemMessageTemplateRepository])
], SystemMessageTemplateService);
//# sourceMappingURL=system-message-template.service.js.map