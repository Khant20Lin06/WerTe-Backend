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
exports.RequestContextMiddleware = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const request_context_service_1 = require("../../infrastructure/logging/request-context.service");
let RequestContextMiddleware = class RequestContextMiddleware {
    constructor(requestContext) {
        this.requestContext = requestContext;
    }
    use(request, response, next) {
        const requestId = request.header('x-request-id')?.trim() || (0, node_crypto_1.randomUUID)();
        request.requestId = requestId;
        response.setHeader('x-request-id', requestId);
        this.requestContext.run({ requestId }, () => next());
    }
};
exports.RequestContextMiddleware = RequestContextMiddleware;
exports.RequestContextMiddleware = RequestContextMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [request_context_service_1.RequestContextService])
], RequestContextMiddleware);
//# sourceMappingURL=request-context.middleware.js.map