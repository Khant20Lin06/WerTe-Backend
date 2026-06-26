"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const audit_module_1 = require("../audit/audit.module");
const auth_repository_1 = require("../auth/repositories/auth.repository");
const session_cache_service_1 = require("../auth/services/session-cache.service");
const merchants_module_1 = require("../merchants/merchants.module");
const users_module_1 = require("../users/users.module");
const admin_inventory_alerts_controller_1 = require("./controllers/admin-inventory-alerts.controller");
const notifications_controller_1 = require("./controllers/notifications.controller");
const notifications_gateway_1 = require("./gateways/notifications.gateway");
const notification_alert_digest_schedule_service_1 = require("./services/notification-alert-digest-schedule.service");
const notification_alert_digest_service_1 = require("./services/notification-alert-digest.service");
const notification_event_service_1 = require("./services/notification-event.service");
const notification_delivery_service_1 = require("./services/notification-delivery.service");
const notification_preferences_service_1 = require("./services/notification-preferences.service");
const notification_preference_schedule_service_1 = require("./services/notification-preference-schedule.service");
const notifications_repository_1 = require("./repositories/notifications.repository");
const admin_inventory_alerts_service_1 = require("./services/admin-inventory-alerts.service");
const notifications_rest_service_1 = require("./services/notifications-rest.service");
const notifications_socket_auth_service_1 = require("./services/notifications-socket-auth.service");
const notifications_service_1 = require("./services/notifications.service");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({}), users_module_1.UsersModule, audit_module_1.AuditModule, merchants_module_1.MerchantsModule],
        controllers: [notifications_controller_1.NotificationsController, admin_inventory_alerts_controller_1.AdminInventoryAlertsController],
        providers: [
            auth_repository_1.AuthRepository,
            session_cache_service_1.SessionCacheService,
            notifications_repository_1.NotificationsRepository,
            notifications_service_1.NotificationsService,
            notification_delivery_service_1.NotificationDeliveryService,
            notification_alert_digest_service_1.NotificationAlertDigestService,
            notification_alert_digest_schedule_service_1.NotificationAlertDigestScheduleService,
            notifications_socket_auth_service_1.NotificationsSocketAuthService,
            notification_preference_schedule_service_1.NotificationPreferenceScheduleService,
            notification_preferences_service_1.NotificationPreferencesService,
            notification_event_service_1.NotificationEventService,
            notifications_rest_service_1.NotificationsRestService,
            admin_inventory_alerts_service_1.AdminInventoryAlertsService,
            notifications_gateway_1.NotificationsGateway,
        ],
        exports: [
            notifications_repository_1.NotificationsRepository,
            notifications_service_1.NotificationsService,
            notification_delivery_service_1.NotificationDeliveryService,
            notification_alert_digest_service_1.NotificationAlertDigestService,
            notification_preference_schedule_service_1.NotificationPreferenceScheduleService,
            notification_preferences_service_1.NotificationPreferencesService,
            notification_event_service_1.NotificationEventService,
            notifications_rest_service_1.NotificationsRestService,
            admin_inventory_alerts_service_1.AdminInventoryAlertsService,
        ],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map