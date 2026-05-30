import { ActorContextDto } from './actor-context.dto';
export declare class LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    userId: string;
    actorContext: ActorContextDto;
}
