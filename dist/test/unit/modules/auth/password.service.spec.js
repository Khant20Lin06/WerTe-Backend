"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const password_service_1 = require("../../../../src/modules/auth/services/password.service");
describe('PasswordService', () => {
    it('compares a matching password successfully', async () => {
        const service = new password_service_1.PasswordService();
        const hash = await service.hash('strong-password');
        const matches = await service.compare('strong-password', hash);
        expect(matches).toBe(true);
    });
    it('rejects a non-matching password', async () => {
        const service = new password_service_1.PasswordService();
        const hash = await service.hash('strong-password');
        const matches = await service.compare('wrong-password', hash);
        expect(matches).toBe(false);
    });
});
//# sourceMappingURL=password.service.spec.js.map