"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullmqModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_alert_digest_job_1 = require("../../jobs/inventory-alert-digest.job");
const message_fallback_job_1 = require("../../jobs/message-fallback.job");
const order_timeout_job_1 = require("../../jobs/order-timeout.job");
const payment_provider_event_processing_job_1 = require("../../jobs/payment-provider-event-processing.job");
const provider_webhook_reconciliation_job_1 = require("../../jobs/provider-webhook-reconciliation.job");
const push_notification_job_1 = require("../../jobs/push-notification.job");
const refund_provider_event_processing_job_1 = require("../../jobs/refund-provider-event-processing.job");
const rider_location_cleanup_job_1 = require("../../jobs/rider-location-cleanup.job");
const notification_module_1 = require("../notifications/notification.module");
const notifications_module_1 = require("../../modules/notifications/notifications.module");
const orders_module_1 = require("../../modules/orders/orders.module");
const payments_module_1 = require("../../modules/payments/payments.module");
const refunds_module_1 = require("../../modules/refunds/refunds.module");
const dlq_service_1 = require("./dlq.service");
const queue_service_1 = require("./queue.service");
let BullmqModule = class BullmqModule {
};
exports.BullmqModule = BullmqModule;
exports.BullmqModule = BullmqModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            notification_module_1.NotificationModule,
            notifications_module_1.NotificationsModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            refunds_module_1.RefundsModule,
        ],
        providers: [
            dlq_service_1.DlqService,
            queue_service_1.QueueService,
            inventory_alert_digest_job_1.InventoryAlertDigestJob,
            push_notification_job_1.PushNotificationJob,
            order_timeout_job_1.OrderTimeoutJob,
            message_fallback_job_1.MessageFallbackJob,
            rider_location_cleanup_job_1.RiderLocationCleanupJob,
            payment_provider_event_processing_job_1.PaymentProviderEventProcessingJob,
            refund_provider_event_processing_job_1.RefundProviderEventProcessingJob,
            provider_webhook_reconciliation_job_1.ProviderWebhookReconciliationJob,
        ],
        exports: [queue_service_1.QueueService, dlq_service_1.DlqService],
    })
], BullmqModule);
//# sourceMappingURL=bullmq.module.js.map