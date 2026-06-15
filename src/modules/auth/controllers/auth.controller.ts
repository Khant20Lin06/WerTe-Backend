import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthMeResponseDto } from '../dto/auth-me-response.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LogoutDto } from '../dto/logout.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { PushTokenResponseDto } from '../dto/push-token-response.dto';
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { RegisterMerchantDto } from '../dto/register-merchant.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import { RegisterRiderDto } from '../dto/register-rider.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UnregisterPushTokenResponseDto } from '../dto/unregister-push-token-response.dto';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    operationId: 'login',
    summary: 'Authenticate user and issue tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Returns access token, refresh token, and actor context for the authenticated user.',
    type: LoginResponseDto,
  })
  @Throttle({ short: { ttl: 60000, limit: 5 }, medium: { ttl: 900000, limit: 20 } })
  @Public()
  @Post('login')
  login(@Body() body: LoginDto, @Req() request: Request) {
    return this.authService.login(body, this.buildSessionMetadata(request));
  }

  @ApiOperation({
    operationId: 'registerCustomer',
    summary: 'Register a customer account and issue tokens',
  })
  @ApiBody({ type: RegisterCustomerDto })
  @ApiOkResponse({
    description:
      'Creates a customer user/profile and returns a token pair for the new account.',
    type: LoginResponseDto,
  })
  @Throttle({ short: { ttl: 60000, limit: 5 }, medium: { ttl: 900000, limit: 20 } })
  @Public()
  @Post('register/customer')
  registerCustomer(@Body() body: RegisterCustomerDto, @Req() request: Request) {
    return this.authService.registerCustomer(
      body,
      this.buildSessionMetadata(request),
    );
  }

  @ApiOperation({
    operationId: 'registerMerchant',
    summary: 'Register a merchant account and issue tokens',
  })
  @ApiBody({ type: RegisterMerchantDto })
  @ApiOkResponse({
    description:
      'Creates a merchant user/profile in pending onboarding state and returns a token pair.',
    type: LoginResponseDto,
  })
  @Throttle({ short: { ttl: 60000, limit: 5 }, medium: { ttl: 900000, limit: 20 } })
  @Public()
  @Post('register/merchant')
  registerMerchant(@Body() body: RegisterMerchantDto, @Req() request: Request) {
    return this.authService.registerMerchant(
      body,
      this.buildSessionMetadata(request),
    );
  }

  @ApiOperation({
    operationId: 'registerRider',
    summary: 'Register a rider account and issue tokens',
  })
  @ApiBody({ type: RegisterRiderDto })
  @ApiOkResponse({
    description:
      'Creates a rider user/profile in pending onboarding state and returns a token pair.',
    type: LoginResponseDto,
  })
  @Throttle({ short: { ttl: 60000, limit: 5 }, medium: { ttl: 900000, limit: 20 } })
  @Public()
  @Post('register/rider')
  registerRider(@Body() body: RegisterRiderDto, @Req() request: Request) {
    return this.authService.registerRider(
      body,
      this.buildSessionMetadata(request),
    );
  }

  @ApiOperation({
    operationId: 'refreshToken',
    summary: 'Rotate an existing refresh token into a new token pair',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description:
      'Returns a newly rotated access token, refresh token, and actor context.',
    type: LoginResponseDto,
  })
  @Public()
  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refreshSession(
      body.refreshToken,
      this.buildSessionMetadata(request),
    );
  }

  @ApiOperation({
    operationId: 'logout',
    summary: 'Revoke the current session or another owned session',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: LogoutDto, required: false })
  @ApiOkResponse({
    description: 'Revokes the target session and returns the revoked session id.',
    type: LogoutResponseDto,
  })
  @Post('logout')
  logout(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: LogoutDto = {},
  ) {
    return this.authService.logout(currentUser, body);
  }

  @ApiOperation({
    operationId: 'getCurrentAuthSession',
    summary: 'Return the current authenticated actor context',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Returns the current session id, user id, role, and actor context.',
    type: AuthMeResponseDto,
  })
  @Get('me')
  me(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.authService.getCurrentSession(currentUser);
  }

  @ApiOperation({
    operationId: 'registerPushToken',
    summary: 'Register or refresh a push token for the authenticated actor',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: RegisterPushTokenDto })
  @ApiOkResponse({
    description:
      'Registers the device push token, refreshing last-seen metadata and reassigning stale tokens when needed.',
    type: PushTokenResponseDto,
  })
  @Post('push-tokens')
  registerPushToken(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() body: RegisterPushTokenDto,
  ) {
    return this.authService.registerPushToken(currentUser, body);
  }

  @ApiOperation({
    operationId: 'unregisterPushToken',
    summary: 'Unregister a push token for the authenticated actor device',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description:
      'Removes the stored push token registration for the requested device identifier.',
    type: UnregisterPushTokenResponseDto,
  })
  @Delete('push-tokens/:deviceId')
  unregisterPushToken(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('deviceId') deviceId: string,
  ) {
    return this.authService.unregisterPushToken(currentUser, deviceId);
  }

  private getHeaderValue(request: Request, name: string): string | null {
    const headerValue = request.headers[name];

    if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
      return headerValue;
    }

    return null;
  }

  private buildSessionMetadata(request: Request) {
    return {
      deviceId: this.getHeaderValue(request, 'x-device-id'),
      userAgent: this.getHeaderValue(request, 'user-agent'),
      ipAddress: request.ip ?? null,
    };
  }
}
