import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type SessionProps = BaseDomainProps & {
    id: string;
    user_id: string;
    session_token: string;
    issued_at: Date;
    expires_at: Date;
    revoked_at: Date | null;
};

export class Session extends BaseDomain {
    constructor(
        private id: string,
        private user_id: string,
        private session_token: string,
        private issued_at: Date,
        private expires_at: Date,
        private revoked_at: Date | null,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
        this.validate();
    }

    /**
     * Validate dữ liệu session
     */
    private validate(): void {
        if (!this.id?.trim()) {
            throw new DomainError('Session ID is required', 400);
        }
        if (!this.user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!this.session_token?.trim()) {
            throw new DomainError('Session token is required', 400);
        }
        if (!this.issued_at || !(this.issued_at instanceof Date)) {
            throw new DomainError('Issued at must be a valid date', 400);
        }
        if (!this.expires_at || !(this.expires_at instanceof Date)) {
            throw new DomainError('Expires at must be a valid date', 400);
        }
    }

    /**
     * Lấy toàn bộ dữ liệu Session dưới dạng DTO
     */
    getDTO(): SessionProps {
        return {
            id: this.id,
            user_id: this.user_id,
            session_token: this.session_token,
            issued_at: this.issued_at,
            expires_at: this.expires_at,
            revoked_at: this.revoked_at,
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
     * Getter - session_token
     */
    getSessionToken(): string {
        return this.session_token;
    }

    /**
     * Getter - issued_at
     */
    getIssuedAt(): Date {
        return this.issued_at;
    }

    /**
     * Getter - expires_at
     */
    getExpiresAt(): Date {
        return this.expires_at;
    }

    /**
     * Getter - revoked_at
     */
    getRevokedAt(): Date | null {
        return this.revoked_at;
    }

    /**
     * Kiểm tra session có hết hạn hay không
     */
    isExpired(now: Date = new Date()): boolean {
        return this.expires_at <= now;
    }

    /**
     * Kiểm tra session có bị revoke hay không
     */
    isRevoked(): boolean {
        return this.revoked_at !== null;
    }

    /**
     * Tạo mới Session
     */
    static create(input: {
        audit_user_id: string;
        new_id: string;
        user_id: string;
        session_token: string;
        issued_at: Date;
        expires_at: Date;
    }): Session {
        const { audit_user_id, new_id, user_id, session_token, issued_at, expires_at } = input;

        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }
        if (!new_id?.trim()) {
            throw new DomainError('Session ID is required', 400);
        }
        if (!user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!session_token?.trim()) {
            throw new DomainError('Session token is required', 400);
        }

        const now = new Date();
        return new Session(
            new_id,
            user_id,
            session_token,
            issued_at,
            expires_at,
            null,
            now,
            audit_user_id,
            now,
            audit_user_id,
        );
    }

    /**
     * Restore Session từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: SessionProps): Session {
        return new Session(
            data.id,
            data.user_id,
            data.session_token,
            data.issued_at,
            data.expires_at,
            data.revoked_at,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của Session
     */
    update(
        audit_user_id: string,
        updates: Partial<Omit<SessionProps, keyof BaseDomainProps | 'id' | 'user_id' | 'session_token'>>,
    ): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (updates.issued_at !== undefined) {
            if (!(updates.issued_at instanceof Date)) {
                throw new DomainError('Issued at must be a valid date', 400);
            }
            this.issued_at = updates.issued_at;
        }

        if (updates.expires_at !== undefined) {
            if (!(updates.expires_at instanceof Date)) {
                throw new DomainError('Expires at must be a valid date', 400);
            }
            this.expires_at = updates.expires_at;
        }

        if (updates.revoked_at !== undefined) {
            this.revoked_at = updates.revoked_at;
        }

        this.updateAuditDomain(audit_user_id);
    }

    /**
     * Revoke session
     */
    revoke(audit_user_id: string): void {
        this.update(audit_user_id, { revoked_at: new Date() });
    }
}
