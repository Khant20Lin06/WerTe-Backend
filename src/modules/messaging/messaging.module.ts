import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditModule } from '../audit/audit.module';
import { AuthRepository } from '../auth/repositories/auth.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AdminMessagingController } from './controllers/admin-messaging.controller';
import { ConversationsController } from './controllers/conversations.controller';
import { CustomerMessagingController } from './controllers/customer-messaging.controller';
import { MerchantMessagingController } from './controllers/merchant-messaging.controller';
import { MessagesController } from './controllers/messages.controller';
import { RiderMessagingController } from './controllers/rider-messaging.controller';
import { SupportMessagingController } from './controllers/support-messaging.controller';
import { MessagingGateway } from './gateways/messaging.gateway';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { SystemMessageTemplateRepository } from './repositories/system-message-template.repository';
import { ConversationService } from './services/conversation.service';
import { ConversationReadService } from './services/conversation-read.service';
import { MessageDeliveryService } from './services/message-delivery.service';
import { MessageReadService } from './services/message-read.service';
import { MessageReceiptService } from './services/message-receipt.service';
import { MessageService } from './services/message.service';
import { MessagingRestService } from './services/messaging-rest.service';
import { MessagingSocketAuthService } from './services/messaging-socket-auth.service';
import { MessagingPolicyService } from './services/message-policy.service';
import { SystemMessageService } from './services/system-message.service';
import { SystemMessageTemplateService } from './services/system-message-template.service';
import { MessagePolicyService } from './policies/message-policy.service';

@Module({
  imports: [JwtModule.register({}), UsersModule, NotificationsModule, AuditModule],
  controllers: [
    ConversationsController,
    MessagesController,
    CustomerMessagingController,
    MerchantMessagingController,
    RiderMessagingController,
    AdminMessagingController,
    SupportMessagingController,
  ],
  providers: [
    AuthRepository,
    ConversationRepository,
    MessageRepository,
    SystemMessageTemplateRepository,
    ConversationService,
    ConversationReadService,
    MessageService,
    MessageReadService,
    MessageReceiptService,
    MessageDeliveryService,
    MessagingRestService,
    MessagingSocketAuthService,
    MessagingPolicyService,
    SystemMessageTemplateService,
    SystemMessageService,
    MessagePolicyService,
    MessagingGateway,
  ],
  exports: [
    SystemMessageService,
    SystemMessageTemplateService,
    ConversationReadService,
    MessageReadService,
  ],
})
export class MessagingModule {}
