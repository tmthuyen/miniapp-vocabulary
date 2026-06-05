import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type ProviderType = 'local' | 'google' | 'facebook' | 'apple';

export type UserAuthProviderProps = BaseDomainProps & {
    id: string;
    user_id: string;
    provider_type: ProviderType;
    provider_user_id: string | null;
    email: string | null;
    password_hash: string | null;
    is_verified: boolean;
};

/**
 * Hàm kiểm tra định dạng email
 */
function isEmail(email: string | null): boolean {
    return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export class UserAuthProvider extends BaseDomain {
    constructor(
        private id: string,
        private user_id: string,
        private provider_type: ProviderType,
        private provider_user_id: string | null,
        private email: string | null,
        private password_hash: string | null,
        private is_verified: boolean,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
    }

    /**
     * Lấy toàn bộ dữ liệu UserAuthProvider dưới dạng DTO
     */
    getDTO(): UserAuthProviderProps {
        return {
            id: this.id,
            user_id: this.user_id,
            provider_type: this.provider_type,
            provider_user_id: this.provider_user_id,
            email: this.email,
            password_hash: this.password_hash,
            is_verified: this.is_verified,
            ...this.getBaseDomainDTO(),
        };
    }

    /**
     * Getter - id
     */
    getId(): string {
        return this.id;
    }

    /**
     * Getter - user_id
     */
    getUserId(): string {
        return this.user_id;
    }

    /**
     * Getter - provider_type
     */
    getProviderType(): ProviderType {
        return this.provider_type;
    }

    /**
     * Getter - provider_user_id
     */
    getProviderUserId(): string | null {
        return this.provider_user_id;
    }

    /**
     * Getter - email
     */
    getEmail(): string | null {
        return this.email;
    }

    /**
     * Getter - password_hash
     */
    getPasswordHash(): string | null {
        return this.password_hash;
    }

    /**
     * Getter - is_verified
     */
    isVerified(): boolean {
        return this.is_verified;
    }

    /**
     * Tạo mới UserAuthProvider với provider local
     */
    static createLocal(input: {
        new_id: string;
        user_id: string;
        email: string;
        password_hash: string;
        audit_user_id: string;
    }): UserAuthProvider {
        const { new_id, user_id, email, password_hash, audit_user_id } = input;

        if (!new_id?.trim()) {
            throw new DomainError('Auth provider ID is required', 400);
        }
        if (!user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!email?.trim() || !isEmail(email)) {
            throw new DomainError('Valid email is required for local provider', 400);
        }
        if (!password_hash?.trim()) {
            throw new DomainError('Password hash is required for local provider', 400);
        }
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        const now = new Date();
        return new UserAuthProvider(
            new_id,
            user_id,
            'local',
            null,
            email,
            password_hash,
            false,
            now,
            audit_user_id,
            now,
            audit_user_id,
        );
    }

    /**
     * Tạo mới UserAuthProvider với provider OAuth (Google, Facebook, Apple)
     */
    static createOAuth(input: {
        new_id: string;
        user_id: string;
        provider_type: Exclude<ProviderType, 'local'>;
        provider_user_id: string;
        email?: string;
        audit_user_id: string;
    }): UserAuthProvider {
        const { new_id, user_id, provider_type, provider_user_id, email, audit_user_id } = input;

        if (!new_id?.trim()) {
            throw new DomainError('Auth provider ID is required', 400);
        }
        if (!user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!provider_type) {
            throw new DomainError('Valid provider type is required for OAuth', 400);
        }
        if (!provider_user_id?.trim()) {
            throw new DomainError('Provider user ID is required for OAuth', 400);
        }
        if (email && !isEmail(email)) {
            throw new DomainError('Invalid email format', 400);
        }
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        const now = new Date();
        return new UserAuthProvider(
            new_id,
            user_id,
            provider_type,
            provider_user_id,
            email ?? null,
            null,
            true,
            now,
            audit_user_id,
            now,
            audit_user_id,
        );
    }

    /**
     * Restore UserAuthProvider từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: UserAuthProviderProps): UserAuthProvider {
        return new UserAuthProvider(
            data.id,
            data.user_id,
            data.provider_type,
            data.provider_user_id,
            data.email,
            data.password_hash,
            data.is_verified,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của UserAuthProvider
     * (chỉ cho local provider)
     */
    update(
        audit_user_id: string,
        updates: Partial<Omit<UserAuthProviderProps, keyof BaseDomainProps | 'id' | 'user_id' | 'provider_type' | 'provider_user_id'>>,
    ): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (this.provider_type !== 'local') {
            throw new DomainError(
                'Can only update email/password for local provider',
                400,
            );
        }

        if (
            updates.email === undefined &&
            updates.password_hash === undefined &&
            updates.is_verified === undefined
        ) {
            throw new DomainError(
                'At least one updatable field must be provided',
                400,
            );
        }

        if (updates.email !== undefined) {
            if (!updates.email) {
                throw new DomainError('Email cannot be empty', 400);
            }
            if (!isEmail(updates.email)) {
                throw new DomainError('Invalid email format', 400);
            }
            this.email = updates.email;
        }

        if (updates.password_hash !== undefined) {
            if (!updates.password_hash?.trim()) {
                throw new DomainError('Password hash cannot be empty', 400);
            }
            this.password_hash = updates.password_hash;
        }

        if (updates.is_verified !== undefined) {
            this.is_verified = updates.is_verified;
        }

        this.updateAuditDomain(audit_user_id);
    }

    /**
     * Cập nhật mật khẩu (chỉ cho local provider)
     */
    updatePassword(audit_user_id: string, newPasswordHash: string): void {
        if (!newPasswordHash?.trim()) {
            throw new DomainError('Password hash cannot be empty', 400);
        }
        this.update(audit_user_id, { password_hash: newPasswordHash });
    }

    /**
     * Đánh dấu email đã xác minh (chỉ cho local provider)
     */
    markEmailVerified(audit_user_id: string): void {
        if (this.provider_type !== 'local') {
            throw new DomainError('Can only verify email for local provider', 400);
        }
        if (this.is_verified) {
            throw new DomainError('Email is already verified', 400);
        }
        this.update(audit_user_id, { is_verified: true });
    }

    /**
     * Đánh dấu email chưa xác minh (chỉ cho local provider)
     */
    markEmailUnverified(audit_user_id: string): void {
        if (this.provider_type !== 'local') {
            throw new DomainError('Can only unverify email for local provider', 400);
        }
        if (!this.is_verified) {
            throw new DomainError('Email is already unverified', 400);
        }
        this.update(audit_user_id, { is_verified: false });
    }
}
