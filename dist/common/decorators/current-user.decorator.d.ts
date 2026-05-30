import { AuthenticatedUserEntity } from '../../modules/auth/entities/authenticated-user.entity';
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUserEntity | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
