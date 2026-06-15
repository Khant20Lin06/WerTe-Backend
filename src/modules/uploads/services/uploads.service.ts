import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as crypto from 'crypto';

import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../common/exceptions/app.exception';
import { S3Service } from '../../../infrastructure/storage/s3.service';
import { S3Config } from '../../../config/s3.config';
import { UploadResponseDto } from '../dto/upload-response.dto';

export type UploadContext = 'menu-items' | 'branch-banners' | 'rider-documents' | 'merchant-documents' | 'chat-attachments';

@Injectable()
export class UploadsService {
  private readonly maxFileSizeBytes: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    const s3 = this.configService.get<S3Config>('s3')!;
    this.maxFileSizeBytes = s3.upload.maxFileSizeBytes;
    this.allowedMimeTypes = s3.upload.allowedMimeTypes;
  }

  async uploadFile(
    file: Express.Multer.File,
    context: UploadContext,
    ownerEntityId: string,
  ): Promise<UploadResponseDto> {
    this.validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase() || this.extFromMime(file.mimetype);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const key = `${context}/${ownerEntityId}/${uniqueId}${ext}`;

    const result = await this.s3Service.upload(key, file.buffer, {
      contentType: file.mimetype,
      acl: 'public-read',
    });

    return { key: result.key, url: result.url };
  }

  private validateFile(file: Express.Multer.File) {
    if (file.size > this.maxFileSizeBytes) {
      throw new AppException(
        `File size ${file.size} exceeds the maximum allowed size of ${this.maxFileSizeBytes} bytes.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new AppException(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };
    return map[mime] ?? '';
  }
}
