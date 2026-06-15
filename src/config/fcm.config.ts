import { registerAs } from '@nestjs/config';

const fcmConfig = registerAs('fcm', () => ({
  projectId: process.env.FCM_PROJECT_ID ?? 'sample-project',
  clientEmail: process.env.FCM_CLIENT_EMAIL ?? '',
  privateKey: (process.env.FCM_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
}));

export type FcmConfig = ReturnType<typeof fcmConfig>;

export default fcmConfig;
