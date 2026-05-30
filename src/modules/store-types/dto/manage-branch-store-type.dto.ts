import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchStoreTypeStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ManageBranchStoreTypeDto {
  @ApiProperty({
    description: 'Store type identifier that should be linked to the branch.',
    example: 'store_type_grocery',
  })
  @IsString()
  @MaxLength(191)
  storeTypeId!: string;

  @ApiPropertyOptional({
    description: 'Requested assignment status. Defaults to APPROVED for admin-originated actions.',
    enum: BranchStoreTypeStatus,
    example: BranchStoreTypeStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(BranchStoreTypeStatus)
  status?: BranchStoreTypeStatus;

  @ApiPropertyOptional({
    description: 'Whether this should become the primary approved store type.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Presentation sort order within the branch.',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Optional note attached to the assignment lifecycle event.',
    example: 'Approved for pilot launch.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
