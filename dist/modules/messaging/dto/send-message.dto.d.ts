import { SendMessageAttachmentDto } from './send-message-attachment.dto';
export declare enum SendMessageTypeValue {
    text = "text",
    image = "image",
    file = "file",
    proofOfHandoff = "proof_of_handoff",
    proofOfDelivery = "proof_of_delivery"
}
export declare class SendMessageDto {
    conversationId: string;
    type?: SendMessageTypeValue;
    body?: string;
    attachments?: SendMessageAttachmentDto[];
}
