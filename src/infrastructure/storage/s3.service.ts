import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { AppLogger } from '../logging/app.logger';
import { S3Config } from '../../config/s3.config';

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class S3Service implements OnModuleInit {
  private client: S3Client | null = null;
  private bucket: string = '';
  private publicBaseUrl: string | undefined;
  private readonly isConfigured: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    const s3 = this.configService.get<S3Config>('s3')!;
    this.isConfigured = !!(s3.accessKeyId && s3.secretAccessKey);
  }

  onModuleInit() {
    const s3 = this.configService.get<S3Config>('s3')!;
    this.bucket = s3.bucket;
    this.publicBaseUrl = s3.publicBaseUrl;

    if (!this.isConfigured) {
      this.logger.logEvent('S3 not configured — running in stub mode.', {}, 'S3Service');
      return;
    }

    this.client = new S3Client({
      region: s3.region,
      ...(s3.endpoint ? { endpoint: s3.endpoint, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: s3.accessKeyId!,
        secretAccessKey: s3.secretAccessKey!,
      },
    });

    this.logger.logEvent(
      'S3 client initialized.',
      { bucket: this.bucket, region: s3.region },
      'S3Service',
    );
  }

  async upload(
    key: string,
    data: Buffer,
    options?: { contentType?: string; acl?: 'private' | 'public-read' },
  ): Promise<UploadResult> {
    if (!this.isConfigured || !this.client) {
      return this.uploadStub(key);
    }

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: options?.contentType ?? 'application/octet-stream',
        ...(options?.acl ? { ACL: options.acl } : {}),
      },
    });

    await upload.done();

    const url = this.buildUrl(key);

    this.logger.logEvent('S3 upload complete.', { key, bucket: this.bucket }, 'S3Service');

    return { key, url };
  }

  async delete(key: string): Promise<void> {
    if (!this.isConfigured || !this.client) {
      this.logger.logEvent('S3 stub delete.', { key }, 'S3Service');
      return;
    }

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    this.logger.logEvent('S3 object deleted.', { key, bucket: this.bucket }, 'S3Service');
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      return false;
    }

    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  buildUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  private uploadStub(key: string): UploadResult {
    const url = `https://stub-bucket.s3.amazonaws.com/${key}`;
    this.logger.logEvent('S3 stub upload.', { key }, 'S3Service');
    return { key, url };
  }
}
