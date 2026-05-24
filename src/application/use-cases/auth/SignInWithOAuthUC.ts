import z from 'zod';
import { IUserAuthProviderRepository } from '@/domain/repositories/IUserAuthProviderRepository';
import { IUserProfileRepository } from '@/domain/repositories/IUserProfileRepository';
import { AssignRoleUC } from './AssignRoleUC';
import { UserAuthProvider } from '@/domain/entities/UserAuthProvider';
import { generateUniqueId } from '@/shared/utils/idUtils';
import { UserProfile } from '@/domain/entities/UserProfile';
import { signInOutput } from './SignInWithEmailPasswordUC';

export const signInWithOAuthInput = z.object({
    provider_type: z.enum(['facebook', 'google', 'apple']),
    provider_user_id: z.string().nonempty(),
    email: z
        .email({
            pattern: /^[\w.-]+@(gmail\.com|yahoo\.com|outlook\.com)$/i,
            message:
                'Email must be a valid email address with domain gmail.com, yahoo.com, or outlook.com',
        })
        .nullable(),
    full_name: z.string().nonempty(),
    avatar_url: z.string().url().nonempty(),
});

export class SignInWithOAuthUC {
    constructor(
        // private readonly bcrypt: IPasswordHasher,
        private readonly userAuthProviderRepo: IUserAuthProviderRepository,
        private readonly userProfileRepo: IUserProfileRepository, 
        private readonly assignRoleUC: AssignRoleUC,
    ) { 
    }

    async execute(
        input: z.infer<typeof signInWithOAuthInput>,
    ): Promise<z.infer<typeof signInOutput>> {
        const {
            provider_type,
            provider_user_id,
            email,
            full_name,
            avatar_url,
        } = input;

        // tìm user auth provider có provider_type và provider_user_id này
        // nếu đã có thì ok, nếu chưa có thì tạo mới user auth provider và user profile
        let userAuthProvider =
            await this.userAuthProviderRepo.getUserByProvider(
                provider_type,
                provider_user_id,
            );

        // nếu chưa có user auth
        if (!userAuthProvider) {
            // lấy thông tin từ email để check có user profile nào có email này không,

            if (email !== null) {
                // nếu có thì liên kết với user auth provider mới,
                const existingUserAuth =
                    await this.userAuthProviderRepo.getUserByEmail(email);
                if (existingUserAuth) {
                    userAuthProvider = UserAuthProvider.createOAuth({
                        new_id: generateUniqueId(),
                        user_id: existingUserAuth.getDTO().user_id,
                        provider_type,
                        provider_user_id,
                        audit_user_id: existingUserAuth.getDTO().user_id,
                    });
                    await this.userAuthProviderRepo.save(userAuthProvider);
                }
            }
        }
        // nếu không có thì tạo mới user profile và liên kết với user auth provider mới
        if (!userAuthProvider) {
            const user_id = generateUniqueId();
            const newUserProfile = UserProfile.create({
                new_id: user_id,
                full_name,
                avatar_url,
                audit_user_id: user_id,
            });
            await this.userProfileRepo.save(newUserProfile);

            userAuthProvider = UserAuthProvider.createOAuth({
                new_id: generateUniqueId(),
                user_id,
                provider_type,
                provider_user_id,
                audit_user_id: user_id,
            });
            await this.userAuthProviderRepo.save(userAuthProvider);

            
            // gán role user mặc định cho user mới
            await this.assignRoleUC.execute(user_id, ['user']);
        }

        const projection =
            await this.userAuthProviderRepo.getSignInProjectionByProvider(
                userAuthProvider.getDTO().provider_type,
                userAuthProvider.getDTO().provider_user_id!,
            );
        if (!projection) {
            throw new Error('Unable to load sign-in projection');
        }

        return {
            user_id: projection.user_id,
            email: projection.email,
            full_name: projection.full_name || full_name,
            role_codes: projection.role_codes,
            avatar_url: projection.avatar_url || avatar_url,
        };
    }
}
