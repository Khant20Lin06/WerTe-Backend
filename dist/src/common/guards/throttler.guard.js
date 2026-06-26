"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpAwareThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const TRUSTED_PROXY_HEADERS = ['x-forwarded-for', 'x-real-ip'];
let IpAwareThrottlerGuard = class IpAwareThrottlerGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        for (const header of TRUSTED_PROXY_HEADERS) {
            const value = req.headers[header];
            if (typeof value === 'string' && value.trim().length > 0) {
                const clientIp = value.split(',')[0].trim();
                if (clientIp.length > 0) {
                    return clientIp;
                }
            }
        }
        return req.ip ?? req.socket.remoteAddress ?? 'unknown';
    }
};
exports.IpAwareThrottlerGuard = IpAwareThrottlerGuard;
exports.IpAwareThrottlerGuard = IpAwareThrottlerGuard = __decorate([
    (0, common_1.Injectable)()
], IpAwareThrottlerGuard);
//# sourceMappingURL=throttler.guard.js.map