import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderDocument, RiderDocumentStatus, RiderDocumentType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UploadRiderDocumentParamsDto {
  @ApiProperty({ enum: RiderDocumentType, description: 'Type of document being uploaded.' })
  @IsEnum(RiderDocumentType)
  type!: RiderDocumentType;
}

export class RiderDocumentDto {
  @ApiProperty({ description: 'Document identifier.', example: 'doc_1' })
  id!: string;

  @ApiProperty({ enum: RiderDocumentType })
  type!: RiderDocumentType;

  @ApiProperty({ description: 'Public URL for the uploaded file.' })
  fileUrl!: string;

  @ApiProperty({ enum: RiderDocumentStatus })
  status!: RiderDocumentStatus;

  @ApiPropertyOptional({ description: 'Reason the document was rejected, if applicable.', nullable: true })
  rejectionReason?: string | null;

  @ApiProperty({ description: 'Upload timestamp.' })
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp.' })
  updatedAt!: string;
}

export function toRiderDocumentDto(doc: RiderDocument): RiderDocumentDto {
  return {
    id: doc.id,
    type: doc.type,
    fileUrl: doc.fileUrl,
    status: doc.status,
    rejectionReason: doc.rejectionReason,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
