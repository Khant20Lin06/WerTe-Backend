import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { UploadResponseDto } from '../dto/upload-response.dto';
import { UploadsService, UploadContext } from '../services/uploads.service';

@ApiTags('uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('menu-items/:branchId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.MERCHANT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a menu item image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'branchId', description: 'Branch ID the item belongs to' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (jpeg/png/webp, max 10 MB)' },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadResponseDto })
  uploadMenuItemImage(
    @Param('branchId') branchId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() _currentUser: AuthenticatedUserEntity,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadFile(file, 'menu-items' as UploadContext, branchId);
  }

  @Post('branch-banners/:branchId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.MERCHANT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a branch banner image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'branchId', description: 'Branch ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (jpeg/png/webp, max 10 MB)' },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadResponseDto })
  uploadBranchBanner(
    @Param('branchId') branchId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() _currentUser: AuthenticatedUserEntity,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadFile(file, 'branch-banners' as UploadContext, branchId);
  }

  @Post('chat-attachments/:conversationId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.RIDER, UserRole.SUPPORT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a chat attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (jpeg/png/webp, max 10 MB)' },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadResponseDto })
  uploadChatAttachment(
    @Param('conversationId') conversationId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() _currentUser: AuthenticatedUserEntity,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadFile(file, 'chat-attachments' as UploadContext, conversationId);
  }
}
