import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

import { AppLogger } from '../logging/app.logger';
import { FcmConfig } from '../../config/fcm.config';

@Injectable()
export class FcmService implements OnModuleInit, OnModuleDestroy {
  private app: admin.app.App | null = null;
  private readonly isConfigured: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    const fcm = this.configService.get<FcmConfig>('fcm')!;
    this.isConfigured = !!(fcm.clientEmail && fcm.privateKey && fcm.projectId !== 'sample-project');
  }

  onModuleInit() {
    if (!this.isConfigured) {
      this.logger.logEvent('FCM not configured — running in stub mode.', {}, 'FcmService');
      return;
    }

    const fcm = this.configService.get<FcmConfig>('fcm')!;

    const existingApp = admin.apps.find((a) => a?.name === 'food-delivery');
    if (existingApp) {
      this.app = existingApp;
      return;
    }

    this.app = admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId: fcm.projectId,
          clientEmail: fcm.clientEmail,
          privateKey: fcm.privateKey,
        }),
      },
      'food-delivery',
    );

    this.logger.logEvent('FCM initialized.', { projectId: fcm.projectId }, 'FcmService');
  }

  async onModuleDestroy() {
    if (this.app) {
      await this.app.delete();
      this.app = null;
    }
  }

  async send(payload: {
    notificationId: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    navigationPath: string | null;
    deviceTokens: string[];
  }): Promise<{
    providerMessageId: string | null;
    deliveredDeviceTokens: string[];
    invalidDeviceTokens: string[];
  }> {
    if (payload.deviceTokens.length === 0) {
      throw new Error('No active push tokens are available for this notification.');
    }

    if (!this.isConfigured || !this.app) {
      return this.sendStub(payload);
    }

    return this.sendReal(payload);
  }

  private async sendReal(payload: {
    notificationId: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    navigationPath: string | null;
    deviceTokens: string[];
  }): Promise<{
    providerMessageId: string | null;
    deliveredDeviceTokens: string[];
    invalidDeviceTokens: string[];
  }> {
    const messaging = this.app!.messaging();

    const data: Record<string, string> = {
      notificationId: payload.notificationId,
      type: payload.type,
    };
    if (payload.navigationPath) {
      data['navigationPath'] = payload.navigationPath;
    }

    const batchResponse = await messaging.sendEachForMulticast({
      tokens: payload.deviceTokens,
      notification: { title: payload.title, body: payload.body },
      data,
      android: { priority: 'high' },
      apns: { payload: { aps: { contentAvailable: true } } },
    });

    const deliveredDeviceTokens: string[] = [];
    const invalidDeviceTokens: string[] = [];

    batchResponse.responses.forEach((resp, idx) => {
      const token = payload.deviceTokens[idx];
      if (resp.success) {
        deliveredDeviceTokens.push(token);
      } else {
        const code = resp.error?.code ?? '';
        const isInvalid =
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token';
        if (isInvalid) {
          invalidDeviceTokens.push(token);
        } else {
          this.logger.logEvent(
            'FCM transient delivery failure.',
            { token, errorCode: code, notificationId: payload.notificationId },
            'FcmService',
          );
        }
      }
    });

    const providerMessageId =
      deliveredDeviceTokens.length > 0 ? `fcm_${payload.notificationId}` : null;

    this.logger.logEvent(
      'FCM multicast sent.',
      {
        notificationId: payload.notificationId,
        userId: payload.userId,
        providerMessageId,
        total: payload.deviceTokens.length,
        delivered: deliveredDeviceTokens.length,
        invalid: invalidDeviceTokens.length,
      },
      'FcmService',
    );

    return { providerMessageId, deliveredDeviceTokens, invalidDeviceTokens };
  }

  private sendStub(payload: {
    notificationId: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    navigationPath: string | null;
    deviceTokens: string[];
  }): {
    providerMessageId: string | null;
    deliveredDeviceTokens: string[];
    invalidDeviceTokens: string[];
  } {
    const invalidDeviceTokens = payload.deviceTokens.filter((t) =>
      t.trim().toLowerCase().startsWith('invalid'),
    );
    const deliveredDeviceTokens = payload.deviceTokens.filter(
      (t) => !invalidDeviceTokens.includes(t),
    );
    const providerMessageId =
      deliveredDeviceTokens.length > 0 ? `fcm_stub_${payload.notificationId}` : null;

    this.logger.logEvent(
      'FCM stub send executed.',
      {
        notificationId: payload.notificationId,
        userId: payload.userId,
        providerMessageId,
        deviceTokenCount: payload.deviceTokens.length,
        deliveredDeviceTokenCount: deliveredDeviceTokens.length,
        invalidDeviceTokenCount: invalidDeviceTokens.length,
      },
      'FcmService',
    );

    return { providerMessageId, deliveredDeviceTokens, invalidDeviceTokens };
  }
}
