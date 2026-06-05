
export interface IPasswordHasher {
    hash(password: string, salt: number): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
}