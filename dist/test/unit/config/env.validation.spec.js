"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_validation_1 = require("../../../src/config/env.validation");
describe('envValidationSchema', () => {
    it('fails when required environment variables are missing', () => {
        const result = env_validation_1.envValidationSchema.validate({}, { abortEarly: false });
        expect(result.error).toBeDefined();
        expect(result.error?.details.map((detail) => detail.path.join('.'))).toEqual(expect.arrayContaining([
            'DATABASE_URL',
            'REDIS_URL',
            'JWT_ACCESS_SECRET',
            'JWT_REFRESH_SECRET',
        ]));
    });
    it('accepts a valid minimal environment contract', () => {
        const result = env_validation_1.envValidationSchema.validate({
            DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/food_delivery',
            REDIS_URL: 'redis://localhost:6379',
            JWT_ACCESS_SECRET: '12345678901234567890123456789012',
            JWT_REFRESH_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
        });
        expect(result.error).toBeUndefined();
        expect(result.value.APP_PREFIX).toBe('api/v1');
        expect(result.value.NODE_ENV).toBe('development');
    });
});
//# sourceMappingURL=env.validation.spec.js.map