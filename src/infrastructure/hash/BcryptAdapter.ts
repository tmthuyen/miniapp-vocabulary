import { IPasswordHasher } from '@/application/interfaces/port/hash/IPasswordHasher';
import bcrypt from 'bcryptjs';
export class BcryptAdapter implements IPasswordHasher {
    async hash(password: string, saltNum: number): Promise<string> {
        const salt = bcrypt.genSaltSync(saltNum);
        const hash = bcrypt.hashSync(password, salt);
        return hash;
    }

    async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compareSync(password, hash);
    }
}
