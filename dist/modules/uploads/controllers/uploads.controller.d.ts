import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { UploadResponseDto } from '../dto/upload-response.dto';
import { UploadsService } from '../services/uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadMenuItemImage(branchId: string, file: Express.Multer.File, _currentUser: AuthenticatedUserEntity): Promise<UploadResponseDto>;
    uploadBranchBanner(branchId: string, file: Express.Multer.File, _currentUser: AuthenticatedUserEntity): Promise<UploadResponseDto>;
    uploadChatAttachment(conversationId: string, file: Express.Multer.File, _currentUser: AuthenticatedUserEntity): Promise<UploadResponseDto>;
}
