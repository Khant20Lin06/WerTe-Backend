import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { S3Config } from '../../config/s3.config';
import { UploadsController } from './controllers/uploads.controller';
import { UploadsService } from './services/uploads.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const s3 = configService.get<S3Config>('s3')!;
        return {
          storage: memoryStorage(),
          // Enforce the file size cap at the Multer layer so oversized uploads
          // are rejected before the file is fully buffered in memory. This
          // prevents OOM attacks regardless of what UploadsService.validateFile
          // checks afterward.
          limits: { fileSize: s3.upload.maxFileSizeBytes },
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
