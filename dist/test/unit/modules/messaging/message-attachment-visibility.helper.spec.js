"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const message_attachment_visibility_helper_1 = require("../../../../src/modules/messaging/policies/message-attachment-visibility.helper");
describe('message attachment visibility helper', () => {
    it('allows all participants to view public attachments', () => {
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.CUSTOMER, client_1.MessageAttachmentVisibility.ALL_PARTICIPANTS)).toBe(true);
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.MERCHANT, client_1.MessageAttachmentVisibility.ALL_PARTICIPANTS)).toBe(true);
    });
    it('restricts merchant-rider-admin attachments away from customers', () => {
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.CUSTOMER, client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN)).toBe(false);
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.RIDER, client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN)).toBe(true);
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.SUPPORT, client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN)).toBe(true);
    });
    it('restricts admin-support-only attachments to operations roles', () => {
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.ADMIN, client_1.MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY)).toBe(true);
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.SUPPORT, client_1.MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY)).toBe(true);
        expect((0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(client_1.ConversationParticipantRole.MERCHANT, client_1.MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY)).toBe(false);
    });
});
//# sourceMappingURL=message-attachment-visibility.helper.spec.js.map