import { PartialType } from '@nestjs/swagger';

import { CreateItemOptionDto } from './create-item-option.dto';

export class UpdateItemOptionDto extends PartialType(CreateItemOptionDto) {}
