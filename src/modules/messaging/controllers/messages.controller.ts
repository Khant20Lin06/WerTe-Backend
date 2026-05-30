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
import { SendMessageDto } from '../dto/send-message.dto';
import { MessageService } from '../services/message.service';

@ApiTags('messaging')
@ApiBearerAuth('access-token')
@Roles(
  UserRole.CUSTOMER,
  UserRole.MERCHANT,
  UserRole.RIDER,
  UserRole.ADMIN,
  UserRole.SUPPORT,
)
@Controller('messaging/messages')
export class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({
    operationId: 'sendMessage',
    summary: 'Send a participant-scoped message in an order conversation lane',
  })
  @ApiBody({ type: SendMessageDto })
  @ApiCreatedResponse({
    description: 'Persists and emits a new message for the conversation.',
  })
  @Post()
  send(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: SendMessageDto,
  ) {
    return this.messageService.send(currentUser, body);
  }
}
