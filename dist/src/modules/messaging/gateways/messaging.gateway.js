"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const join_conversation_dto_1 = require("../dto/join-conversation.dto");
const mark_message_read_request_dto_1 = require("../dto/mark-message-read-request.dto");
const send_message_dto_1 = require("../dto/send-message.dto");
const conversation_read_service_1 = require("../services/conversation-read.service");
const message_delivery_service_1 = require("../services/message-delivery.service");
const message_receipt_service_1 = require("../services/message-receipt.service");
const message_service_1 = require("../services/message.service");
const messaging_socket_auth_service_1 = require("../services/messaging-socket-auth.service");
let MessagingGateway = class MessagingGateway {
    constructor(messagingSocketAuthService, conversationReadService, messageService, messageReceiptService, messageDeliveryService) {
        this.messagingSocketAuthService = messagingSocketAuthService;
        this.conversationReadService = conversationReadService;
        this.messageService = messageService;
        this.messageReceiptService = messageReceiptService;
        this.messageDeliveryService = messageDeliveryService;
    }
    afterInit(server) {
        this.messageDeliveryService.attachServer(server);
    }
    async handleConnection(client) {
        try {
            client.data.currentUser =
                await this.messagingSocketAuthService.authenticateClient(client);
        }
        catch (_error) {
            client.disconnect(true);
        }
    }
    async handleJoin(client, payload) {
        const currentUser = this.getCurrentUserOrThrow(client);
        const conversation = await this.conversationReadService.getCurrentUserConversation(currentUser, payload.conversationId);
        await client.join(payload.conversationId);
        return {
            conversationId: payload.conversationId,
            joined: true,
            conversation,
        };
    }
    async handleLeave(client, payload) {
        this.getCurrentUserOrThrow(client);
        await client.leave(payload.conversationId);
        return {
            conversationId: payload.conversationId,
            left: true,
        };
    }
    async handleSend(client, payload) {
        const currentUser = this.getCurrentUserOrThrow(client);
        return this.messageService.send(currentUser, payload);
    }
    async handleMarkRead(client, payload) {
        const currentUser = this.getCurrentUserOrThrow(client);
        return this.messageReceiptService.markMessageRead(currentUser, payload.messageId);
    }
    getCurrentUserOrThrow(client) {
        const currentUser = client.data.currentUser;
        if (currentUser === undefined) {
            throw new websockets_1.WsException('Unauthenticated socket connection.');
        }
        return currentUser;
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation.join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        join_conversation_dto_1.JoinConversationDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation.leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        join_conversation_dto_1.JoinConversationDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message.send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleSend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message.read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        mark_message_read_request_dto_1.MarkMessageReadRequestDto]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleMarkRead", null);
exports.MessagingGateway = MessagingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/messaging',
        cors: {
            origin: process.env.APP_CORS_ORIGINS
                ? process.env.APP_CORS_ORIGINS.split(',').map((o) => o.trim())
                : process.env.NODE_ENV === 'production'
                    ? false
                    : true,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [messaging_socket_auth_service_1.MessagingSocketAuthService,
        conversation_read_service_1.ConversationReadService,
        message_service_1.MessageService,
        message_receipt_service_1.MessageReceiptService,
        message_delivery_service_1.MessageDeliveryService])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map