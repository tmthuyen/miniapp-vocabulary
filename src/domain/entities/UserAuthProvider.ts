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

function isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export class UserAuthProvider extends BaseDomain {
    private domainProps: UserAuthProviderProps;

    constructor(inputProps: UserAuthProviderProps) {
        super(inputProps);
        if (!inputProps.id || !inputProps.user_id || !inputProps.provider_type) {
            throw new DomainError('Invalid user auth provider data', 400);
        }
        if (inputProps.email && !isEmail(inputProps.email)) {
            throw new DomainError('Invalid email format', 400);
        }
        this.domainProps = inputProps;
    }

    getDTO(): UserAuthProviderProps {
        return this.domainProps;
    }

    static createLocal(input: {
        new_id: string;
        user_id: string;
        email: string;
        password_hash: string;
        audit_user_id: string;
    }): UserAuthProvider {
        if (!input.new_id || !input.user_id) {
            throw new DomainError('New ID and User ID are required', 400);
        }
        if (!input.email || !input.password_hash) {
            throw new DomainError(
                'Email and password hash are required for local provider',
                400,
            );
        }

        const entity = new UserAuthProvider({
            id: input.new_id,
            user_id: input.user_id,
            provider_type: 'local',
            email: input.email,
            password_hash: input.password_hash,
            provider_user_id: null,
            is_verified: false,
            created_at: null,
            created_by: null,
            updated_at: null,
            updated_by: null,
        });

        entity.createBaseDomain(input.audit_user_id);
        return entity;
    }

    static createOAuth(input: {
        new_id: string;
        user_id: string;
        provider_type: ProviderType;
        provider_user_id: string;
        email?: string;
        audit_user_id: string;
    }): UserAuthProvider {
        if (!input.provider_type || !input.provider_user_id) {
            throw new DomainError(
                'Provider type and provider user ID are required for OAuth',
                400,
            );
        }
        if (!input.new_id || !input.user_id) {
            throw new DomainError('New ID and User ID are required', 400);
        }

        const entity = new UserAuthProvider({
            id: input.new_id,
            user_id: input.user_id,
            provider_type: input.provider_type,
            email: input.email || null,
            password_hash: null,
            provider_user_id: input.provider_user_id,
            is_verified: true,
            created_at: null,
            created_by: null,
            updated_at: null,
            updated_by: null,
        });

        entity.createBaseDomain(input.audit_user_id);
        return entity;
    }

    private update(
        audit_user_id: string,
        updates: Partial<UserAuthProviderProps>,
    ) {
        if (this.domainProps.provider_type !== 'local') {
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
        this.updateBaseDomain(audit_user_id);
        this.domainProps = { ...this.domainProps, ...updates, ...super.getDTO() };
    }

    updatePassword(audit_user_id: string, newPasswordHash: string) {
        if (this.domainProps.provider_type !== 'local') {
            throw new DomainError('Can only update password for local provider', 400);
        }
        this.update(audit_user_id, { password_hash: newPasswordHash });
    }

    markedEmailVerified(audit_user_id: string) {
        if (this.domainProps.provider_type !== 'local') {
            throw new DomainError('Can only verify email for local provider', 400);
        }
        if (this.domainProps.is_verified) {
            throw new DomainError('Email is already verified', 400);
        }
        this.update(audit_user_id, { is_verified: true });
    }
}
