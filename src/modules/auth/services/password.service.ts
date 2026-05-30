import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class PasswordService {
  compare(plainTextPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainTextPassword, passwordHash);
  }

  hash(plainTextPassword: string, rounds = 12): Promise<string> {
    return hash(plainTextPassword, rounds);
  }
}
