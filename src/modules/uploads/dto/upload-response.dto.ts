import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'menu-items/branch_1/item_abc123.jpg' })
  key!: string;

  @ApiProperty({ example: 'https://food-delivery-assets.s3.amazonaws.com/menu-items/branch_1/item_abc123.jpg' })
  url!: string;
}
