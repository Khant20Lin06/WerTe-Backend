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
exports.CreateConversationDto = exports.ConversationTypeValue = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ConversationTypeValue;
(function (ConversationTypeValue) {
    ConversationTypeValue["orderChat"] = "order_chat";
    ConversationTypeValue["customerMerchant"] = "customer_merchant";
    ConversationTypeValue["customerRider"] = "customer_rider";
    ConversationTypeValue["merchantRider"] = "merchant_rider";
    ConversationTypeValue["customerOperations"] = "customer_operations";
    ConversationTypeValue["merchantOperations"] = "merchant_operations";
    ConversationTypeValue["riderOperations"] = "rider_operations";
})(ConversationTypeValue || (exports.ConversationTypeValue = ConversationTypeValue = {}));
class CreateConversationDto {
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Order identifier that scopes the conversation.',
        example: 'ord_123',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Allowed conversation type for the order-scoped chat flow.',
        enum: ConversationTypeValue,
        enumName: 'ConversationTypeValue',
        example: ConversationTypeValue.customerRider,
    }),
    (0, class_validator_1.IsEnum)(ConversationTypeValue),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "type", void 0);
//# sourceMappingURL=create-conversation.dto.js.map