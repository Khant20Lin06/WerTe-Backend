export declare enum SendMessageAttachmentTypeValue {
    image = "image",
    file = "file",
    proofOfHandoff = "proof_of_handoff",
    proofOfDelivery = "proof_of_delivery"
}
export declare class SendMessageAttachmentDto {
    type: SendMessageAttachmentTypeValue;
    storageKey: string;
    fileName?: string;
    mimeType?: string;
    fileSizeBytes?: number;
    width?: number;
    height?: number;
}
