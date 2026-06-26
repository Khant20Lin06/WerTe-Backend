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
exports.ConversationsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_conversation_dto_1 = require("../dto/create-conversation.dto");
const conversation_service_1 = require("../services/conversation.service");
let ConversationsController = class ConversationsController {
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    create(currentUser, body) {
        return this.conversationService.resolve(currentUser, body);
    }
};
exports.ConversationsController = ConversationsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'resolveConversation',
        summary: 'Resolve an order-scoped conversation lane for the authenticated actor',
    }),
    (0, swagger_1.ApiBody)({ type: create_conversation_dto_1.CreateConversationDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Resolves a stable conversation lane and syncs eligible participants for the order.',
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "create", null);
exports.ConversationsController = ConversationsController = __decorate([
    (0, swagger_1.ApiTags)('messaging'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER, client_1.UserRole.MERCHANT, client_1.UserRole.RIDER, client_1.UserRole.ADMIN, client_1.UserRole.SUPPORT),
    (0, common_1.Controller)('messaging/conversations'),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationsController);
//# sourceMappingURL=conversations.controller.js.map