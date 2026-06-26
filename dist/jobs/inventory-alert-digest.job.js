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
exports.InventoryAlertDigestJob = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
const notification_alert_digest_service_1 = require("../modules/notifications/services/notification-alert-digest.service");
let InventoryAlertDigestJob = class InventoryAlertDigestJob {
    constructor(queueService, notificationAlertDigestService, logger) {
        this.queueService = queueService;
        this.notificationAlertDigestService = notificationAlertDigestService;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.inventoryAlertDigest, (payload) => this.handle(payload));
    }
    async handle(payload) {
        const at = this.resolveTriggeredAt(payload.triggeredAtIso);
        const result = await this.notificationAlertDigestService.runDigestCycle(at);
        this.logger.logEvent('Inventory alert digest job completed.', {
            triggeredAtIso: at.toISOString(),
            ...result,
        }, 'InventoryAlertDigestJob');
    }
    resolveTriggeredAt(triggeredAtIso) {
        if (triggeredAtIso === undefined || triggeredAtIso === null) {
            return new Date();
        }
        const parsed = new Date(triggeredAtIso);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
};
exports.InventoryAlertDigestJob = InventoryAlertDigestJob;
exports.InventoryAlertDigestJob = InventoryAlertDigestJob = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        notification_alert_digest_service_1.NotificationAlertDigestService,
        app_logger_1.AppLogger])
], InventoryAlertDigestJob);
//# sourceMappingURL=inventory-alert-digest.job.js.map