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
var NotificationAlertDigestScheduleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAlertDigestScheduleService = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../../../infrastructure/logging/app.logger");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
let NotificationAlertDigestScheduleService = NotificationAlertDigestScheduleService_1 = class NotificationAlertDigestScheduleService {
    constructor(queueService, logger) {
        this.queueService = queueService;
        this.logger = logger;
        this.interval = null;
    }
    async onModuleInit() {
        await this.enqueueDigestRun();
        this.interval = setInterval(() => {
            void this.enqueueDigestRun();
        }, NotificationAlertDigestScheduleService_1.intervalMs);
        this.interval.unref?.();
        this.logger.debugEvent('Scheduled recurring inventory alert digest job.', {
            intervalMs: NotificationAlertDigestScheduleService_1.intervalMs,
        }, 'NotificationAlertDigestScheduleService');
    }
    onModuleDestroy() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    async enqueueDigestRun() {
        const triggeredAtIso = new Date().toISOString();
        await this.queueService.add(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.inventoryAlertDigest, {
            triggeredAtIso,
        });
        this.logger.debugEvent('Queued inventory alert digest job.', {
            triggeredAtIso,
        }, 'NotificationAlertDigestScheduleService');
    }
};
exports.NotificationAlertDigestScheduleService = NotificationAlertDigestScheduleService;
NotificationAlertDigestScheduleService.intervalMs = 15 * 60 * 1000;
exports.NotificationAlertDigestScheduleService = NotificationAlertDigestScheduleService = NotificationAlertDigestScheduleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        app_logger_1.AppLogger])
], NotificationAlertDigestScheduleService);
//# sourceMappingURL=notification-alert-digest-schedule.service.js.map