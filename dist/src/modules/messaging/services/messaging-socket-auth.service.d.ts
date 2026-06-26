import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { UsersService } from '../../users/services/users.service';
export declare class MessagingSocketAuthService {
    private readonly configService;
    private readonly jwtService;
    private readonly authRepository;
    private readonly usersService;
    constructor(configService: ConfigService, jwtService: JwtService, authRepository: AuthRepository, usersService: UsersService);
    authenticateClient(client: Socket): Promise<AuthenticatedUserEntity>;
    private extractAccessToken;
    private verifyAccessToken;
}
