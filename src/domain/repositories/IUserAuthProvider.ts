import { z } from 'zod';
import { UserAuthProvider } from '../entities/UserAuthProvider';

export interface IUserAuthProviderRepository {
    getUserByProvider(
        providerType: string,
        providerId: string,
    ): Promise<UserAuthProvider | null>;
    getUserByEmail(email: string): Promise<UserAuthProvider | null>;
    
    // nếu không có email nào trùng thì tạo mới, còn nếu đã có rồi thì cập nhật provider_type, provider_user_id và password_hash (nếu provider_type là local)
    updateAuthLocal(
        userId: string,
        email: string,
        newPasswordHash: string,
    ): Promise<UserAuthProvider>;

    linkProviderToUser(
        userId: string,
        providerType: string,
        providerId: string,
    ): Promise<UserAuthProvider>;
    unlinkProviderFromUser(userId: string, providerType: string): Promise<UserAuthProvider | null>;
}
