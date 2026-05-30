import { PartialType } from '@nestjs/swagger';

import { CreateItemVariantCombinationDto } from './create-item-variant-combination.dto';

export class UpdateItemVariantCombinationDto extends PartialType(
  CreateItemVariantCombinationDto,
) {}
