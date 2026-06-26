import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import fcmConfig from './config/fcm.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import s3Config from './config/s3.config';
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
import { MetricsModule } from './infrastructure/metrics/metrics.module';
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
import { UploadsModule } from './modules/uploads/uploads.module';
import { StaffModule } from './modules/staff/staff.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { IpAwareThrottlerGuard } from './common/guards/throttler.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, fcmConfig, s3Config],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttlers = [
          { name: 'short',  ttl: 1000,  limit: 10  },
          { name: 'medium', ttl: 10000, limit: 50  },
          { name: 'long',   ttl: 60000, limit: 200 },
        ];

        // In test environments there is no real Redis connection available.
        // Fall back to in-memory throttler storage so tests don't need Redis.
        if (process.env['NODE_ENV'] === 'test') {
          return { throttlers };
        }

        return {
          throttlers,
          storage: new ThrottlerStorageRedisService(
            new Redis(configService.getOrThrow<string>('redis.url')),
          ),
        };
      },
    }),
    LoggerModule,
    MetricsModule,
    PrismaModule,
    RedisModule,
    BullmqModule,
    WebsocketModule,
    StorageModule,
    NotificationModule,
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
    UploadsModule,
    StaffModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: IpAwareThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
