import { SendMessageAttachmentDto } from './send-message-attachment.dto';
import { SendMessageTypeValue } from './send-message.dto';
export declare class SendConversationMessageDto {
    type?: SendMessageTypeValue;
    body?: string;
    attachments?: SendMessageAttachmentDto[];
}
