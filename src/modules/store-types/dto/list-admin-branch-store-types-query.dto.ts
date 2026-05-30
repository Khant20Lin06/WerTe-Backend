import { ApiPropertyOptional } from '@nestjs/swagger';
import { BranchStoreTypeStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListAdminBranchStoreTypesQueryDto {
  @ApiPropertyOptional({
    description: 'Optional branch identifier filter.',
    example: 'branch_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Optional store type identifier filter.',
    example: 'store_type_grocery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  storeTypeId?: string;

  @ApiPropertyOptional({
    description: 'Optional status filter.',
    enum: BranchStoreTypeStatus,
    example: BranchStoreTypeStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(BranchStoreTypeStatus)
  status?: BranchStoreTypeStatus;
}
