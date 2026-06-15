import { registerAs } from '@nestjs/config';

const s3Config = registerAs('s3', () => ({
  bucket: process.env.S3_BUCKET ?? 'food-delivery-assets',
  region: process.env.S3_REGION ?? 'ap-southeast-1',
  endpoint: process.env.S3_ENDPOINT ?? undefined,
  accessKeyId: process.env.S3_ACCESS_KEY_ID ?? undefined,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? undefined,
  publicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? undefined,
  upload: {
    maxFileSizeBytes: Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES ?? 10 * 1024 * 1024),
    allowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES ?? 'image/jpeg,image/png,image/webp').split(','),
  },
}));

export type S3Config = ReturnType<typeof s3Config>;

export default s3Config;
