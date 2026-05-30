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
exports.SendMessageDto = exports.SendMessageTypeValue = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const send_message_attachment_dto_1 = require("./send-message-attachment.dto");
var SendMessageTypeValue;
(function (SendMessageTypeValue) {
    SendMessageTypeValue["text"] = "text";
    SendMessageTypeValue["image"] = "image";
    SendMessageTypeValue["file"] = "file";
    SendMessageTypeValue["proofOfHandoff"] = "proof_of_handoff";
    SendMessageTypeValue["proofOfDelivery"] = "proof_of_delivery";
})(SendMessageTypeValue || (exports.SendMessageTypeValue = SendMessageTypeValue = {}));
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation receiving the message.',
        example: 'con_123',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message type the authenticated actor is sending.',
        enum: SendMessageTypeValue,
        enumName: 'SendMessageTypeValue',
        example: SendMessageTypeValue.text,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SendMessageTypeValue),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message body for text or caption-style payloads.',
        example: 'I am on the way.',
        maxLength: 1000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], SendMessageDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attachment references associated with the message payload.',
        type: [send_message_attachment_dto_1.SendMessageAttachmentDto],
        required: false,
        example: [
            {
                type: send_message_attachment_dto_1.SendMessageAttachmentTypeValue.image,
                storageKey: 'messages/order_1/image_1.jpg',
            },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(10),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => send_message_attachment_dto_1.SendMessageAttachmentDto),
    __metadata("design:type", Array)
], SendMessageDto.prototype, "attachments", void 0);
//# sourceMappingURL=send-message.dto.js.map