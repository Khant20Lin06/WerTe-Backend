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
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const log_redaction_util_1 = require("./log-redaction.util");
const request_context_service_1 = require("./request-context.service");
let AppLogger = class AppLogger extends common_1.Logger {
    constructor(requestContext) {
        super();
        this.requestContext = requestContext;
    }
    logEvent(message, metadata, context) {
        super.log(this.serialize('log', message, metadata), context);
    }
    warnEvent(message, metadata, context) {
        super.warn(this.serialize('warn', message, metadata), context);
    }
    debugEvent(message, metadata, context) {
        super.debug(this.serialize('debug', message, metadata), context);
    }
    errorEvent(message, metadata, context, trace) {
        super.error(this.serialize('error', message, metadata), trace, context);
    }
    serialize(level, message, metadata) {
        return JSON.stringify({
            level,
            message,
            requestId: this.requestContext.getRequestId() ?? 'system',
            timestamp: new Date().toISOString(),
            metadata: metadata == null ? undefined : (0, log_redaction_util_1.redactSensitiveData)(metadata),
        });
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [request_context_service_1.RequestContextService])
], AppLogger);
//# sourceMappingURL=app.logger.js.map