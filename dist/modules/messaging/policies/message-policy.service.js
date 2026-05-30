"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePolicyService = void 0;
const common_1 = require("@nestjs/common");
const conversation_resolution_policy_helper_1 = require("./conversation-resolution-policy.helper");
let MessagePolicyService = class MessagePolicyService {
    canResolveConversation(currentUser, order, type) {
        return (0, conversation_resolution_policy_helper_1.canResolveConversationForOrder)({
            currentUser,
            order,
            type,
        });
    }
    buildConversationParticipants(currentUser, order, type) {
        return (0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type,
        });
    }
    buildConversationTitle(order, type) {
        return (0, conversation_resolution_policy_helper_1.buildConversationTitle)(order, type);
    }
};
exports.MessagePolicyService = MessagePolicyService;
exports.MessagePolicyService = MessagePolicyService = __decorate([
    (0, common_1.Injectable)()
], MessagePolicyService);
//# sourceMappingURL=message-policy.service.js.map