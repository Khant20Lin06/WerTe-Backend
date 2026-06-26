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
exports.SendMessageAttachmentDto = exports.SendMessageAttachmentTypeValue = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var SendMessageAttachmentTypeValue;
(function (SendMessageAttachmentTypeValue) {
    SendMessageAttachmentTypeValue["image"] = "image";
    SendMessageAttachmentTypeValue["file"] = "file";
    SendMessageAttachmentTypeValue["proofOfHandoff"] = "proof_of_handoff";
    SendMessageAttachmentTypeValue["proofOfDelivery"] = "proof_of_delivery";
})(SendMessageAttachmentTypeValue || (exports.SendMessageAttachmentTypeValue = SendMessageAttachmentTypeValue = {}));
class SendMessageAttachmentDto {
}
exports.SendMessageAttachmentDto = SendMessageAttachmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attachment type attached to the message.',
        enum: SendMessageAttachmentTypeValue,
        enumName: 'SendMessageAttachmentTypeValue',
        example: SendMessageAttachmentTypeValue.image,
    }),
    (0, class_validator_1.IsEnum)(SendMessageAttachmentTypeValue),
    __metadata("design:type", String)
], SendMessageAttachmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Storage key or object key for the uploaded attachment.',
        example: 'proofs/order_1/handoff_1.jpg',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageAttachmentDto.prototype, "storageKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original filename for the attachment.',
        example: 'handoff.jpg',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageAttachmentDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type of the attachment.',
        example: 'image/jpeg',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageAttachmentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attachment size in bytes.',
        example: 1048576,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SendMessageAttachmentDto.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attachment width for image payloads.',
        example: 1200,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SendMessageAttachmentDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attachment height for image payloads.',
        example: 900,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SendMessageAttachmentDto.prototype, "height", void 0);
//# sourceMappingURL=send-message-attachment.dto.js.map