"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const messaging_socket_auth_service_1 = require("../../../../src/modules/messaging/services/messaging-socket-auth.service");
describe('MessagingSocketAuthService', () => {
    it('authenticates a socket from a bearer token header', async () => {
        const configService = {
            getOrThrow: jest.fn().mockImplementation((key) => {
                switch (key) {
                    case 'jwt.accessSecret':
                        return 'secret';
                    case 'jwt.issuer':
                        return 'issuer';
                    case 'jwt.audience':
                        return 'audience';
                    default:
                        return key;
                }
            }),
        };
        const jwtService = {
            verifyAsync: jest.fn().mockResolvedValue({
                sub: 'usr_1',
                role: client_1.UserRole.CUSTOMER,
                sessionId: 'sess_1',
                type: 'access',
            }),
        };
        const authRepository = {
            findSessionById: jest.fn().mockResolvedValue({
                id: 'sess_1',
                userId: 'usr_1',
                revokedAt: null,
                expiresAt: new Date(Date.now() + 60_000),
                user: {
                    id: 'usr_1',
                    role: client_1.UserRole.CUSTOMER,
                    phone: '09123456789',
                    status: client_1.UserStatus.ACTIVE,
                },
            }),
        };
        const usersService = {
            isSuspended: jest.fn().mockReturnValue(false),
            isPending: jest.fn().mockReturnValue(false),
            buildActorContext: jest.fn().mockReturnValue({
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            }),
        };
        const service = new messaging_socket_auth_service_1.MessagingSocketAuthService(configService, jwtService, authRepository, usersService);
        const result = await service.authenticateClient({
            handshake: {
                auth: {},
                headers: {
                    authorization: 'Bearer access-token',
                },
            },
        });
        expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
            secret: 'secret',
            issuer: 'issuer',
            audience: 'audience',
        });
        expect(result).toMatchObject({
            userId: 'usr_1',
            sessionId: 'sess_1',
            role: client_1.UserRole.CUSTOMER,
        });
    });
    it('rejects sockets without an access token', async () => {
        const service = new messaging_socket_auth_service_1.MessagingSocketAuthService({}, {}, {}, {});
        await expect(service.authenticateClient({
            handshake: {
                auth: {},
                headers: {},
            },
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNAUTHORIZED,
        });
    });
});
//# sourceMappingURL=messaging-socket-auth.service.spec.js.map