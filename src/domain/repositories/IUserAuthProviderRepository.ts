import { UserAuthProvider } from '../entities/UserAuthProvider';

export type SignInProjection = {
    user_id: string;
    email: string | null;
    password_hash: string | null;
    full_name: string;
    avatar_url: string | null;
    role_codes: string[];
};

export interface IUserAuthProviderRepository {
    save(userAuthProvider: UserAuthProvider): Promise<UserAuthProvider>;
    getUserByEmail(email: string): Promise<UserAuthProvider | null>;
    getSignInProjectionByEmail(email: string): Promise<SignInProjection | null>;
    getUserByProvider(
        providerType: string,
        providerId: string,
    ): Promise<UserAuthProvider | null>;
    getSignInProjectionByProvider(
        providerType: string,
        providerId: string,
    ): Promise<SignInProjection | null>;
}
