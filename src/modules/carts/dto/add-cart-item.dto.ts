import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'Branch identifier that owns the cart and menu item.',
    example: 'branch_1',
  })
  @IsString()
  @MaxLength(191)
  branchId!: string;

  @ApiProperty({
    description: 'Menu item identifier to add into the cart.',
    example: 'item_1',
  })
  @IsString()
  @MaxLength(191)
  menuItemId!: string;

  @ApiProperty({
    description: 'Requested quantity for the cart item.',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Optional item option identifiers selected for the cart item.',
    example: ['option_1', 'option_2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(191, { each: true })
  selectedOptionIds?: string[];
}
