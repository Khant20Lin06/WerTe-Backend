import { PartialType } from '@nestjs/swagger';

import { CreateItemOptionGroupDto } from './create-item-option-group.dto';

export class UpdateItemOptionGroupDto extends PartialType(
  CreateItemOptionGroupDto,
) {}
