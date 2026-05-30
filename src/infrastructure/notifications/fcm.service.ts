import { Injectable } from '@nestjs/common';

import { AppLogger } from '../logging/app.logger';

@Injectable()
export class FcmService {
  constructor(private readonly logger: AppLogger) {}

  async send(payload: {
    notificationId: string;
    userId: string;
    title: string;
    body: string;
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

    const invalidDeviceTokens = payload.deviceTokens.filter((token) =>
      token.trim().toLowerCase().startsWith('invalid'),
    );
    const deliveredDeviceTokens = payload.deviceTokens.filter(
      (token) => !invalidDeviceTokens.includes(token),
    );
    const providerMessageId =
      deliveredDeviceTokens.length > 0
        ? `fcm_stub_${payload.notificationId}`
        : null;

    this.logger.logEvent(
      'FCM send baseline executed.',
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

    return {
      providerMessageId,
      deliveredDeviceTokens,
      invalidDeviceTokens,
    };
  }
}
