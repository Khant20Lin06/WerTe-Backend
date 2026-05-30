import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SendMessageAttachmentTypeValue {
  image = 'image',
  file = 'file',
  proofOfHandoff = 'proof_of_handoff',
  proofOfDelivery = 'proof_of_delivery',
}

export class SendMessageAttachmentDto {
  @ApiProperty({
    description: 'Attachment type attached to the message.',
    enum: SendMessageAttachmentTypeValue,
    enumName: 'SendMessageAttachmentTypeValue',
    example: SendMessageAttachmentTypeValue.image,
  })
  @IsEnum(SendMessageAttachmentTypeValue)
  type!: SendMessageAttachmentTypeValue;

  @ApiProperty({
    description: 'Storage key or object key for the uploaded attachment.',
    example: 'proofs/order_1/handoff_1.jpg',
  })
  @IsString()
  storageKey!: string;

  @ApiProperty({
    description: 'Original filename for the attachment.',
    example: 'handoff.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({
    description: 'MIME type of the attachment.',
    example: 'image/jpeg',
    required: false,
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({
    description: 'Attachment size in bytes.',
    example: 1048576,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSizeBytes?: number;

  @ApiProperty({
    description: 'Attachment width for image payloads.',
    example: 1200,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiProperty({
    description: 'Attachment height for image payloads.',
    example: 900,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
