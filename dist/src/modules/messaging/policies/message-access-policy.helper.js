"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveConversationParticipant = getActiveConversationParticipant;
exports.canAccessConversation = canAccessConversation;
exports.canSendMessage = canSendMessage;
exports.canSendAttachment = canSendAttachment;
exports.canModerateConversation = canModerateConversation;
const client_1 = require("@prisma/client");
function getActiveConversationParticipant({ currentUser, conversation, }) {
    return (conversation.participants.find((participant) => participant.userId === currentUser.userId && participant.leftAt === null) ?? null);
}
function canAccessConversation(input) {
    return getActiveConversationParticipant(input) !== null;
}
function canSendMessage({ currentUser, conversation, messageType, }) {
    const participant = getActiveConversationParticipant({
        currentUser,
        conversation,
    });
    if (participant === null || !participant.canSendMessages) {
        return false;
    }
    if (isProofMessageType(messageType)) {
        return participant.canSendProofs;
    }
    return true;
}
function canSendAttachment({ currentUser, conversation, attachmentType, }) {
    const participant = getActiveConversationParticipant({
        currentUser,
        conversation,
    });
    if (participant === null || !participant.canSendAttachments) {
        return false;
    }
    if (isProofAttachmentType(attachmentType)) {
        return participant.canSendProofs;
    }
    return true;
}
function canModerateConversation(input) {
    const participant = getActiveConversationParticipant(input);
    return participant?.canModerate === true;
}
function isProofMessageType(messageType) {
    return (messageType === client_1.MessageType.PROOF_OF_HANDOFF ||
        messageType === client_1.MessageType.PROOF_OF_DELIVERY);
}
function isProofAttachmentType(attachmentType) {
    return (attachmentType === client_1.MessageAttachmentType.PROOF_OF_HANDOFF ||
        attachmentType === client_1.MessageAttachmentType.PROOF_OF_DELIVERY);
}
//# sourceMappingURL=message-access-policy.helper.js.map