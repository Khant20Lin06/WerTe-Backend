import { PasswordService } from '../../../../src/modules/auth/services/password.service';

describe('PasswordService', () => {
  it('compares a matching password successfully', async () => {
    const service = new PasswordService();
    const hash = await service.hash('strong-password');

    const matches = await service.compare('strong-password', hash);

    expect(matches).toBe(true);
  });

  it('rejects a non-matching password', async () => {
    const service = new PasswordService();
    const hash = await service.hash('strong-password');

    const matches = await service.compare('wrong-password', hash);

    expect(matches).toBe(false);
  });
});
