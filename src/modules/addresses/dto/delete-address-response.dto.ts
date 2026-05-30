import { ApiProperty } from '@nestjs/swagger';

export class DeleteAddressResponseDto {
  @ApiProperty({
    description: 'Deleted address identifier.',
    example: 'addr_1',
  })
  deletedAddressId!: string;
}
