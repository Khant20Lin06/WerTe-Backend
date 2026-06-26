"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const audit_module_1 = require("../audit/audit.module");
const auth_repository_1 = require("../auth/repositories/auth.repository");
const session_cache_service_1 = require("../auth/services/session-cache.service");
const notifications_module_1 = require("../notifications/notifications.module");
const users_module_1 = require("../users/users.module");
const admin_messaging_controller_1 = require("./controllers/admin-messaging.controller");
const conversations_controller_1 = require("./controllers/conversations.controller");
const customer_messaging_controller_1 = require("./controllers/customer-messaging.controller");
const merchant_messaging_controller_1 = require("./controllers/merchant-messaging.controller");
const messages_controller_1 = require("./controllers/messages.controller");
const rider_messaging_controller_1 = require("./controllers/rider-messaging.controller");
const support_messaging_controller_1 = require("./controllers/support-messaging.controller");
const messaging_gateway_1 = require("./gateways/messaging.gateway");
const conversation_repository_1 = require("./repositories/conversation.repository");
const message_repository_1 = require("./repositories/message.repository");
const system_message_template_repository_1 = require("./repositories/system-message-template.repository");
const conversation_service_1 = require("./services/conversation.service");
const conversation_read_service_1 = require("./services/conversation-read.service");
const message_delivery_service_1 = require("./services/message-delivery.service");
const message_read_service_1 = require("./services/message-read.service");
const message_receipt_service_1 = require("./services/message-receipt.service");
const message_service_1 = require("./services/message.service");
const messaging_rest_service_1 = require("./services/messaging-rest.service");
const messaging_socket_auth_service_1 = require("./services/messaging-socket-auth.service");
const message_policy_service_1 = require("./services/message-policy.service");
const system_message_service_1 = require("./services/system-message.service");
const system_message_template_service_1 = require("./services/system-message-template.service");
const message_policy_service_2 = require("./policies/message-policy.service");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({}), users_module_1.UsersModule, notifications_module_1.NotificationsModule, audit_module_1.AuditModule],
        controllers: [
            conversations_controller_1.ConversationsController,
            messages_controller_1.MessagesController,
            customer_messaging_controller_1.CustomerMessagingController,
            merchant_messaging_controller_1.MerchantMessagingController,
            rider_messaging_controller_1.RiderMessagingController,
            admin_messaging_controller_1.AdminMessagingController,
            support_messaging_controller_1.SupportMessagingController,
        ],
        providers: [
            auth_repository_1.AuthRepository,
            session_cache_service_1.SessionCacheService,
            conversation_repository_1.ConversationRepository,
            message_repository_1.MessageRepository,
            system_message_template_repository_1.SystemMessageTemplateRepository,
            conversation_service_1.ConversationService,
            conversation_read_service_1.ConversationReadService,
            message_service_1.MessageService,
            message_read_service_1.MessageReadService,
            message_receipt_service_1.MessageReceiptService,
            message_delivery_service_1.MessageDeliveryService,
            messaging_rest_service_1.MessagingRestService,
            messaging_socket_auth_service_1.MessagingSocketAuthService,
            message_policy_service_1.MessagingPolicyService,
            system_message_template_service_1.SystemMessageTemplateService,
            system_message_service_1.SystemMessageService,
            message_policy_service_2.MessagePolicyService,
            messaging_gateway_1.MessagingGateway,
        ],
        exports: [
            system_message_service_1.SystemMessageService,
            system_message_template_service_1.SystemMessageTemplateService,
            conversation_read_service_1.ConversationReadService,
            message_read_service_1.MessageReadService,
        ],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map