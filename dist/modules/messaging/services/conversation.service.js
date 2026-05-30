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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const conversation_order_context_entity_1 = require("../entities/conversation-order-context.entity");
const create_conversation_dto_1 = require("../dto/create-conversation.dto");
const message_policy_service_1 = require("../policies/message-policy.service");
const conversation_repository_1 = require("../repositories/conversation.repository");
const conversationTypeMap = {
    [create_conversation_dto_1.ConversationTypeValue.orderChat]: client_1.ConversationType.ORDER_CHAT,
    [create_conversation_dto_1.ConversationTypeValue.customerMerchant]: client_1.ConversationType.CUSTOMER_MERCHANT,
    [create_conversation_dto_1.ConversationTypeValue.customerRider]: client_1.ConversationType.CUSTOMER_RIDER,
    [create_conversation_dto_1.ConversationTypeValue.merchantRider]: client_1.ConversationType.MERCHANT_RIDER,
    [create_conversation_dto_1.ConversationTypeValue.customerOperations]: client_1.ConversationType.CUSTOMER_OPERATIONS,
    [create_conversation_dto_1.ConversationTypeValue.merchantOperations]: client_1.ConversationType.MERCHANT_OPERATIONS,
    [create_conversation_dto_1.ConversationTypeValue.riderOperations]: client_1.ConversationType.RIDER_OPERATIONS,
};
let ConversationService = class ConversationService {
    constructor(conversationRepository, messagePolicyService) {
        this.conversationRepository = conversationRepository;
        this.messagePolicyService = messagePolicyService;
    }
    async resolve(currentUser, dto) {
        const type = conversationTypeMap[dto.type];
        const order = await this.conversationRepository.findOrderContextById(dto.orderId);
        if (order === null) {
            throw new app_exception_1.AppException('Order was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if ((0, conversation_order_context_entity_1.supportsAssignedRiderConversation)(type) &&
            order.rider === null &&
            type !== client_1.ConversationType.ORDER_CHAT) {
            throw new app_exception_1.AppException('This conversation lane is not available until a rider is assigned.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        if (!this.messagePolicyService.canResolveConversation(currentUser, order, type)) {
            throw new app_exception_1.AppException('You are not allowed to resolve this conversation lane.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const participants = this.messagePolicyService.buildConversationParticipants(currentUser, order, type);
        if (participants === null || participants.length === 0) {
            throw new app_exception_1.AppException('The conversation lane could not be resolved for this order.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return this.conversationRepository.resolve({
            orderId: order.orderId,
            type,
            title: this.messagePolicyService.buildConversationTitle(order, type),
            participants,
        });
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_repository_1.ConversationRepository,
        message_policy_service_1.MessagePolicyService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map