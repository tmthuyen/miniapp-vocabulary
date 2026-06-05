import z from 'zod';
import { IUserAuthProviderRepository } from '@/domain/repositories/IUserAuthProviderRepository';
import { UserAuthProvider } from '@/domain/entities/UserAuthProvider';
import { generateUniqueId } from '@/shared/utils/idUtils';
import { IPasswordHasher } from '@/application/interfaces/port/hash/IPasswordHasher';

export const updateEmailPasswordInput = z.object({
    audit_user_id: z.string().nonempty(),
    user_id: z.string().nonempty(),
    // @gmail.com, @yahoo.com, @outlook.com,
    email: z.email({
        pattern: /^[\w.-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i,
        message:
            'Email must be a valid email address with domain gmail.com, yahoo.com, or outlook.com',
    }),
    password: z.string().min(6),
});

export class UpdateEmailPasswordUC {
    constructor(
        private readonly bcrypt: IPasswordHasher,
        private readonly repo: IUserAuthProviderRepository,
    ) {}

    async execute(
        input: z.infer<typeof updateEmailPasswordInput>,
    ): Promise<void> {
        const { audit_user_id, user_id, email, password } = input;
        if (!user_id) throw new Error('userId is required');
        if (!email) throw new Error('email is required');
        if (!password) throw new Error('password is required');

        const passwordHash = await this.bcrypt.hash(password, 10);

        const existing = await this.repo.getUserByEmail(email);

        if (existing && existing.getDTO().user_id !== user_id) {
            throw new Error('Email already in use');
        }

        // nếu có email (local) rồi thì update password, còn các provider khác thì không cho đổi email/password
        if (existing && existing.getDTO().user_id === user_id) {
            existing.updatePassword(audit_user_id, passwordHash);
            await this.repo.save(existing);
            return;
        }

        // nếu chưa có email (local) thì tạo mới
        // cần xác thực email ở use-case khác
        if (!existing) {
            const newUserAuthProvider = UserAuthProvider.createLocal({
                new_id: generateUniqueId(),
                user_id,
                email,
                password_hash: passwordHash,
                audit_user_id,
            });
            await this.repo.save(newUserAuthProvider);
        }
    }
}
