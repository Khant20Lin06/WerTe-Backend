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
exports.FcmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
const app_logger_1 = require("../logging/app.logger");
let FcmService = class FcmService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.app = null;
        const fcm = this.configService.get('fcm');
        this.isConfigured = !!(fcm.clientEmail && fcm.privateKey && fcm.projectId !== 'sample-project');
    }
    onModuleInit() {
        if (!this.isConfigured) {
            this.logger.logEvent('FCM not configured — running in stub mode.', {}, 'FcmService');
            return;
        }
        const fcm = this.configService.get('fcm');
        const existingApp = admin.apps.find((a) => a?.name === 'food-delivery');
        if (existingApp) {
            this.app = existingApp;
            return;
        }
        this.app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: fcm.projectId,
                clientEmail: fcm.clientEmail,
                privateKey: fcm.privateKey,
            }),
        }, 'food-delivery');
        this.logger.logEvent('FCM initialized.', { projectId: fcm.projectId }, 'FcmService');
    }
    async onModuleDestroy() {
        if (this.app) {
            await this.app.delete();
            this.app = null;
        }
    }
    async send(payload) {
        if (payload.deviceTokens.length === 0) {
            throw new Error('No active push tokens are available for this notification.');
        }
        if (!this.isConfigured || !this.app) {
            return this.sendStub(payload);
        }
        return this.sendReal(payload);
    }
    async sendReal(payload) {
        const messaging = this.app.messaging();
        const data = {
            notificationId: payload.notificationId,
        };
        if (payload.navigationPath) {
            data['navigationPath'] = payload.navigationPath;
        }
        const batchResponse = await messaging.sendEachForMulticast({
            tokens: payload.deviceTokens,
            notification: { title: payload.title, body: payload.body },
            data,
            android: { priority: 'high' },
            apns: { payload: { aps: { contentAvailable: true } } },
        });
        const deliveredDeviceTokens = [];
        const invalidDeviceTokens = [];
        batchResponse.responses.forEach((resp, idx) => {
            const token = payload.deviceTokens[idx];
            if (resp.success) {
                deliveredDeviceTokens.push(token);
            }
            else {
                const code = resp.error?.code ?? '';
                const isInvalid = code === 'messaging/registration-token-not-registered' ||
                    code === 'messaging/invalid-registration-token';
                if (isInvalid) {
                    invalidDeviceTokens.push(token);
                }
                else {
                    this.logger.logEvent('FCM transient delivery failure.', { token, errorCode: code, notificationId: payload.notificationId }, 'FcmService');
                }
            }
        });
        const providerMessageId = deliveredDeviceTokens.length > 0 ? `fcm_${payload.notificationId}` : null;
        this.logger.logEvent('FCM multicast sent.', {
            notificationId: payload.notificationId,
            userId: payload.userId,
            providerMessageId,
            total: payload.deviceTokens.length,
            delivered: deliveredDeviceTokens.length,
            invalid: invalidDeviceTokens.length,
        }, 'FcmService');
        return { providerMessageId, deliveredDeviceTokens, invalidDeviceTokens };
    }
    sendStub(payload) {
        const invalidDeviceTokens = payload.deviceTokens.filter((t) => t.trim().toLowerCase().startsWith('invalid'));
        const deliveredDeviceTokens = payload.deviceTokens.filter((t) => !invalidDeviceTokens.includes(t));
        const providerMessageId = deliveredDeviceTokens.length > 0 ? `fcm_stub_${payload.notificationId}` : null;
        this.logger.logEvent('FCM stub send executed.', {
            notificationId: payload.notificationId,
            userId: payload.userId,
            providerMessageId,
            deviceTokenCount: payload.deviceTokens.length,
            deliveredDeviceTokenCount: deliveredDeviceTokens.length,
            invalidDeviceTokenCount: invalidDeviceTokens.length,
        }, 'FcmService');
        return { providerMessageId, deliveredDeviceTokens, invalidDeviceTokens };
    }
};
exports.FcmService = FcmService;
exports.FcmService = FcmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_logger_1.AppLogger])
], FcmService);
//# sourceMappingURL=fcm.service.js.map