import { ApiProperty } from '@nestjs/swagger';

export class MenuScopedStoreTypeDto {
  @ApiProperty({
    description: 'Dynamic store type identifier.',
    example: 'store_type_grocery',
  })
  id!: string;

  @ApiProperty({
    description: 'Dynamic store type code.',
    example: 'grocery',
  })
  code!: string;

  @ApiProperty({
    description: 'Dynamic store type display name.',
    example: 'Grocery',
  })
  name!: string;

  @ApiProperty({
    description: 'Presentation sort order for the store type.',
    example: 10,
  })
  sortOrder!: number;
}
