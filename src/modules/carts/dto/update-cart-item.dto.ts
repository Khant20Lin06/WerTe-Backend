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

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New requested quantity for the cart item.',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description:
      'Optional full replacement list of selected item option identifiers.',
    example: ['option_1', 'option_3'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(191, { each: true })
  selectedOptionIds?: string[];
}
