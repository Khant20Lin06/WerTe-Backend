"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canParticipantViewAttachment = canParticipantViewAttachment;
const client_1 = require("@prisma/client");
function canParticipantViewAttachment(role, visibility) {
    switch (visibility) {
        case client_1.MessageAttachmentVisibility.ALL_PARTICIPANTS:
            return true;
        case client_1.MessageAttachmentVisibility.OPERATIONS_ONLY:
            return (role === client_1.ConversationParticipantRole.ADMIN ||
                role === client_1.ConversationParticipantRole.SUPPORT);
        case client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN:
            return (role === client_1.ConversationParticipantRole.MERCHANT ||
                role === client_1.ConversationParticipantRole.RIDER ||
                role === client_1.ConversationParticipantRole.ADMIN ||
                role === client_1.ConversationParticipantRole.SUPPORT);
        case client_1.MessageAttachmentVisibility.RIDER_CUSTOMER_ADMIN:
            return (role === client_1.ConversationParticipantRole.RIDER ||
                role === client_1.ConversationParticipantRole.CUSTOMER ||
                role === client_1.ConversationParticipantRole.ADMIN ||
                role === client_1.ConversationParticipantRole.SUPPORT);
        case client_1.MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY:
            return (role === client_1.ConversationParticipantRole.ADMIN ||
                role === client_1.ConversationParticipantRole.SUPPORT);
        default:
            return false;
    }
}
//# sourceMappingURL=message-attachment-visibility.helper.js.map