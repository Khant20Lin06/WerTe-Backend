import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../../infrastructure/storage/s3.service';
import { UploadResponseDto } from '../dto/upload-response.dto';
export type UploadContext = 'menu-items' | 'branch-banners' | 'rider-documents' | 'merchant-documents' | 'chat-attachments';
export declare class UploadsService {
    private readonly s3Service;
    private readonly configService;
    private readonly maxFileSizeBytes;
    private readonly allowedMimeTypes;
    constructor(s3Service: S3Service, configService: ConfigService);
    uploadFile(file: Express.Multer.File, context: UploadContext, ownerEntityId: string): Promise<UploadResponseDto>;
    private validateFile;
    private extFromMime;
}
