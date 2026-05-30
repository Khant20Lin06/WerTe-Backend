import { Body, Controller, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { ConversationService } from '../services/conversation.service';

@ApiTags('messaging')
@ApiBearerAuth('access-token')
@Roles(
  UserRole.CUSTOMER,
  UserRole.MERCHANT,
  UserRole.RIDER,
  UserRole.ADMIN,
  UserRole.SUPPORT,
)
@Controller('messaging/conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOperation({
    operationId: 'resolveConversation',
    summary: 'Resolve an order-scoped conversation lane for the authenticated actor',
  })
  @ApiBody({ type: CreateConversationDto })
  @ApiCreatedResponse({
    description:
      'Resolves a stable conversation lane and syncs eligible participants for the order.',
  })
  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: CreateConversationDto,
  ) {
    return this.conversationService.resolve(currentUser, body);
  }
}
