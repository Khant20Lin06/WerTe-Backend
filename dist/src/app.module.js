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
const throttler_1 = require("@nestjs/throttler");
const throttler_storage_redis_1 = require("@nest-lab/throttler-storage-redis");
const ioredis_1 = require("ioredis");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const fcm_config_1 = require("./config/fcm.config");
const jwt_config_1 = require("./config/jwt.config");
const redis_config_1 = require("./config/redis.config");
const s3_config_1 = require("./config/s3.config");
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
const metrics_module_1 = require("./infrastructure/metrics/metrics.module");
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
const provider_webhooks_module_1 = require("./modules/provider-webhooks/provider-webhooks.module");
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
const store_types_module_1 = require("./modules/store-types/store-types.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const staff_module_1 = require("./modules/staff/staff.module");
const ratings_module_1 = require("./modules/ratings/ratings.module");
const throttler_guard_1 = require("./common/guards/throttler.guard");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, redis_config_1.default, jwt_config_1.default, fcm_config_1.default, s3_config_1.default],
                validationSchema: env_validation_1.envValidationSchema,
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const throttlers = [
                        { name: 'short', ttl: 1000, limit: 10 },
                        { name: 'medium', ttl: 10000, limit: 50 },
                        { name: 'long', ttl: 60000, limit: 200 },
                    ];
                    if (process.env['NODE_ENV'] === 'test') {
                        return { throttlers };
                    }
                    return {
                        throttlers,
                        storage: new throttler_storage_redis_1.ThrottlerStorageRedisService(new ioredis_1.default(configService.getOrThrow('redis.url'))),
                    };
                },
            }),
            logger_module_1.LoggerModule,
            metrics_module_1.MetricsModule,
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            bullmq_module_1.BullmqModule,
            websocket_module_1.WebsocketModule,
            storage_module_1.StorageModule,
            notification_module_1.NotificationModule,
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
            provider_webhooks_module_1.ProviderWebhooksModule,
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
            store_types_module_1.StoreTypesModule,
            uploads_module_1.UploadsModule,
            staff_module_1.StaffModule,
            ratings_module_1.RatingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_guard_1.IpAwareThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map