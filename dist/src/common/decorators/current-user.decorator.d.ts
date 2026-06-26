import { AuthenticatedUserEntity } from '../../modules/auth/entities/authenticated-user.entity';
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | keyof AuthenticatedUserEntity | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
