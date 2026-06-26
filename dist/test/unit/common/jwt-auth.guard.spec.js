"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../../src/common/exceptions/app.exception");
const jwt_auth_guard_1 = require("../../../src/common/guards/jwt-auth.guard");
describe('JwtAuthGuard', () => {
    it('bypasses authentication for public routes', async () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(true),
        };
        const guard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
        };
        await expect(guard.canActivate(context)).resolves.toBe(true);
    });
    it('returns the authenticated user when passport succeeds', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(false),
        };
        const guard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
        const user = {
            userId: 'usr_1',
        };
        expect(guard.handleRequest(null, user)).toBe(user);
    });
    it('normalizes missing authenticated user into a standard unauthorized exception', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(false),
        };
        const guard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
        try {
            guard.handleRequest(null, null);
            fail('Expected guard to throw an unauthorized exception.');
        }
        catch (error) {
            expect(error).toMatchObject({
                status: common_1.HttpStatus.UNAUTHORIZED,
                response: expect.objectContaining({
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required.',
                }),
            });
        }
    });
    it('rethrows strategy errors without masking them', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(false),
        };
        const guard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
        const error = new app_exception_1.AppException('Invalid access token.', common_1.HttpStatus.UNAUTHORIZED);
        expect(() => guard.handleRequest(error, null)).toThrow(error);
    });
});
//# sourceMappingURL=jwt-auth.guard.spec.js.map