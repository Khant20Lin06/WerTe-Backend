import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class GetCartQueryDto {
  @ApiProperty({
    description: 'Branch identifier used to scope the active cart lookup.',
    example: 'branch_1',
  })
  @IsString()
  @MaxLength(191)
  branchId!: string;
}
