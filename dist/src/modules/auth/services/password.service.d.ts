export declare class PasswordService {
    compare(plainTextPassword: string, passwordHash: string): Promise<boolean>;
    hash(plainTextPassword: string, rounds?: number): Promise<string>;
}
