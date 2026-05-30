import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { envValidationSchema } from './config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { BullmqModule } from './infrastructure/queue/bullmq.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { NotificationModule } from './infrastructure/notifications/notification.module';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomerProfilesModule } from './modules/customer-profiles/customer-profiles.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { MenusModule } from './modules/menus/menus.module';
import { CartsModule } from './modules/carts/carts.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { ProviderWebhooksModule } from './modules/provider-webhooks/provider-webhooks.module';
import { RidersModule } from './modules/riders/riders.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ZonesModule } from './modules/zones/zones.module';
import { SupportModule } from './modules/support/support.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module';
import { AuditModule } from './modules/audit/audit.module';
import { StoreTypesModule } from './modules/store-types/store-types.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PoliciesGuard } from './common/guards/policies.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    RedisModule,
    BullmqModule,
    WebsocketModule,
    StorageModule,
    NotificationModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    CustomerProfilesModule,
    AddressesModule,
    MerchantsModule,
    BranchesModule,
    MenusModule,
    CartsModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
    RefundsModule,
    ProviderWebhooksModule,
    RidersModule,
    DeliveriesModule,
    DispatchModule,
    MessagingModule,
    NotificationsModule,
    PromotionsModule,
    ZonesModule,
    SupportModule,
    ReportsModule,
    AdminOpsModule,
    AuditModule,
    StoreTypesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
})
export class AppModule {}
