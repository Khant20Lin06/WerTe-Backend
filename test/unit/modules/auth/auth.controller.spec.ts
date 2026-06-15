import { AuthController } from '../../../../src/modules/auth/controllers/auth.controller';
import { AuthService } from '../../../../src/modules/auth/services/auth.service';

describe('AuthController', () => {
  const request = {
    headers: {
      'x-device-id': 'web-1',
      'user-agent': 'jest',
    },
    ip: '127.0.0.1',
  } as never;

  it('delegates customer registration to the auth service with session metadata', async () => {
    const authService = {
      registerCustomer: jest.fn().mockResolvedValue({ userId: 'usr_1' }),
    } as unknown as jest.Mocked<AuthService>;
    const controller = new AuthController(authService);

    await expect(
      controller.registerCustomer(
        {
          phone: '+959123456789',
          password: 'Customer@1234',
          fullName: 'Mg Mg',
        },
        request,
      ),
    ).resolves.toEqual({ userId: 'usr_1' });

    expect(authService.registerCustomer).toHaveBeenCalledWith(
      {
        phone: '+959123456789',
        password: 'Customer@1234',
        fullName: 'Mg Mg',
      },
      {
        deviceId: 'web-1',
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      },
    );
  });

  it('delegates merchant registration to the auth service', async () => {
    const authService = {
      registerMerchant: jest.fn().mockResolvedValue({ userId: 'usr_merchant_1' }),
    } as unknown as jest.Mocked<AuthService>;
    const controller = new AuthController(authService);

    await controller.registerMerchant(
      {
        phone: '+959123456780',
        password: 'Merchant@1234',
        name: 'Tea House',
      },
      request,
    );

    expect(authService.registerMerchant).toHaveBeenCalledWith(
      {
        phone: '+959123456780',
        password: 'Merchant@1234',
        name: 'Tea House',
      },
      expect.objectContaining({
        deviceId: 'web-1',
      }),
    );
  });

  it('delegates rider registration to the auth service', async () => {
    const authService = {
      registerRider: jest.fn().mockResolvedValue({ userId: 'usr_rider_1' }),
    } as unknown as jest.Mocked<AuthService>;
    const controller = new AuthController(authService);

    await controller.registerRider(
      {
        phone: '+959777777777',
        password: 'Rider@1234',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
      },
      request,
    );

    expect(authService.registerRider).toHaveBeenCalledWith(
      {
        phone: '+959777777777',
        password: 'Rider@1234',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
      },
      expect.objectContaining({
        deviceId: 'web-1',
      }),
    );
  });
});
