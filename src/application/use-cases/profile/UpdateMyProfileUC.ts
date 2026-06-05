import type { IUserProfileRepository } from '@/domain/repositories/IUserProfileRepository';
import type {
    UserProfile,
} from '@/domain/entities/UserProfile';
import z from 'zod';

export const updateMyProfileInput = z.object({
    full_name: z.string().nonempty(),
    avatar_url: z.string().nullable(),
    target_band: z.number().nullable(),
});

export class UpdateMyProfileUC {
    constructor(private readonly repo: IUserProfileRepository) {}

    async execute(
        userId: string,
        input: z.infer<typeof updateMyProfileInput>,
    ): Promise<UserProfile> {
        if (!userId) throw new Error('userId is required');
        const user = await this.repo.getByUserId(userId);
        if (!user) throw new Error('User not found');

        // chỉ cho thay đổi fields nào được phép, ví dụ: full_name, avatar_url, target_band
        
        user.update(userId, input);
        return user;
    }
}
