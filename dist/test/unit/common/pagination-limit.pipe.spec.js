"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const pagination_limit_pipe_1 = require("../../../src/common/pipes/pagination-limit.pipe");
describe('PaginationLimitPipe', () => {
    const pipe = new pagination_limit_pipe_1.PaginationLimitPipe();
    describe('pass-through cases', () => {
        it('returns undefined for undefined input', () => {
            expect(pipe.transform(undefined)).toBeUndefined();
        });
        it('returns undefined for null input', () => {
            expect(pipe.transform(null)).toBeUndefined();
        });
        it('returns undefined for empty string', () => {
            expect(pipe.transform('')).toBeUndefined();
        });
        it('coerces a valid numeric string to a number', () => {
            expect(pipe.transform('20')).toBe(20);
        });
        it('accepts limit = 1 (minimum boundary)', () => {
            expect(pipe.transform('1')).toBe(1);
        });
        it('accepts limit = 100 (maximum boundary)', () => {
            expect(pipe.transform('100')).toBe(100);
        });
    });
    describe('rejection cases', () => {
        it('throws BadRequestException for limit > 100', () => {
            expect(() => pipe.transform('101')).toThrow(common_1.BadRequestException);
        });
        it('throws BadRequestException for a large limit (9999)', () => {
            expect(() => pipe.transform('9999')).toThrow(common_1.BadRequestException);
        });
        it('throws BadRequestException for limit = 0', () => {
            expect(() => pipe.transform('0')).toThrow(common_1.BadRequestException);
        });
        it('throws BadRequestException for a negative limit', () => {
            expect(() => pipe.transform('-1')).toThrow(common_1.BadRequestException);
        });
        it('throws BadRequestException for a non-numeric string', () => {
            expect(() => pipe.transform('abc')).toThrow(common_1.BadRequestException);
        });
        it('throws BadRequestException for a float string', () => {
            expect(() => pipe.transform('1.5')).toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=pagination-limit.pipe.spec.js.map