import { ConversationParticipantRole, MessageAttachmentVisibility } from '@prisma/client';
export declare function canParticipantViewAttachment(role: ConversationParticipantRole, visibility: MessageAttachmentVisibility): boolean;
