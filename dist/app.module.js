"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const jwt_config_1 = require("./config/jwt.config");
const redis_config_1 = require("./config/redis.config");
const env_validation_1 = require("./config/env.validation");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./infrastructure/database/prisma.module");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const bullmq_module_1 = require("./infrastructure/queue/bullmq.module");
const websocket_module_1 = require("./infrastructure/websocket/websocket.module");
const storage_module_1 = require("./infrastructure/storage/storage.module");
const notification_module_1 = require("./infrastructure/notifications/notification.module");
const logger_module_1 = require("./infrastructure/logging/logger.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const customer_profiles_module_1 = require("./modules/customer-profiles/customer-profiles.module");
const addresses_module_1 = require("./modules/addresses/addresses.module");
const merchants_module_1 = require("./modules/merchants/merchants.module");
const branches_module_1 = require("./modules/branches/branches.module");
const menus_module_1 = require("./modules/menus/menus.module");
const carts_module_1 = require("./modules/carts/carts.module");
const checkout_module_1 = require("./modules/checkout/checkout.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const refunds_module_1 = require("./modules/refunds/refunds.module");
const riders_module_1 = require("./modules/riders/riders.module");
const deliveries_module_1 = require("./modules/deliveries/deliveries.module");
const dispatch_module_1 = require("./modules/dispatch/dispatch.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const promotions_module_1 = require("./modules/promotions/promotions.module");
const zones_module_1 = require("./modules/zones/zones.module");
const support_module_1 = require("./modules/support/support.module");
const reports_module_1 = require("./modules/reports/reports.module");
const admin_ops_module_1 = require("./modules/admin-ops/admin-ops.module");
const audit_module_1 = require("./modules/audit/audit.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const policies_guard_1 = require("./common/guards/policies.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, redis_config_1.default, jwt_config_1.default],
                validationSchema: env_validation_1.envValidationSchema,
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            bullmq_module_1.BullmqModule,
            websocket_module_1.WebsocketModule,
            storage_module_1.StorageModule,
            notification_module_1.NotificationModule,
            logger_module_1.LoggerModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            customer_profiles_module_1.CustomerProfilesModule,
            addresses_module_1.AddressesModule,
            merchants_module_1.MerchantsModule,
            branches_module_1.BranchesModule,
            menus_module_1.MenusModule,
            carts_module_1.CartsModule,
            checkout_module_1.CheckoutModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            refunds_module_1.RefundsModule,
            riders_module_1.RidersModule,
            deliveries_module_1.DeliveriesModule,
            dispatch_module_1.DispatchModule,
            messaging_module_1.MessagingModule,
            notifications_module_1.NotificationsModule,
            promotions_module_1.PromotionsModule,
            zones_module_1.ZonesModule,
            support_module_1.SupportModule,
            reports_module_1.ReportsModule,
            admin_ops_module_1.AdminOpsModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: policies_guard_1.PoliciesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map