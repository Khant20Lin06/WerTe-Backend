"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const fcmConfig = (0, config_1.registerAs)('fcm', () => ({
    projectId: process.env.FCM_PROJECT_ID ?? 'sample-project',
    clientEmail: process.env.FCM_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FCM_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
}));
exports.default = fcmConfig;
//# sourceMappingURL=fcm.config.js.map