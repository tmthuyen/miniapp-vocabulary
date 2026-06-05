import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type RoleProps = BaseDomainProps & {
    id: string;
    name: string;
    code: string;
};

export class Role extends BaseDomain {
    constructor(
        private id: string,
        private name: string,
        private code: string,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
    }

    /**
     * Lấy toàn bộ dữ liệu Role dưới dạng DTO
     */
    getDTO(): RoleProps {
        return {
            id: this.id,
            name: this.name,
            code: this.code,
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
     * Getter - name
     */
    getName(): string {
        return this.name;
    }

    /**
     * Getter - code
     */
    getCode(): string {
        return this.code;
    }

    /**
     * Tạo mới Role
     */
    static create(input: {
        new_id: string;
        name: string;
        code: string;
        audit_user_id: string;
    }): Role {
        const { new_id, name, code, audit_user_id } = input;

        if (!new_id?.trim()) {
            throw new DomainError('Role ID is required', 400);
        }
        if (!name?.trim()) {
            throw new DomainError('Role name is required', 400);
        }
        if (!code?.trim()) {
            throw new DomainError('Role code is required', 400);
        }
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        const now = new Date();
        return new Role(new_id, name, code, now, audit_user_id, now, audit_user_id);
    }

    /**
     * Restore Role từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: RoleProps): Role {
        return new Role(
            data.id,
            data.name,
            data.code,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của Role
     */
    update(audit_user_id: string, updates: Partial<Omit<RoleProps, keyof BaseDomainProps>>): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (updates.name !== undefined) {
            if (!updates.name?.trim()) {
                throw new DomainError('Role name cannot be empty', 400);
            }
            this.name = updates.name;
        }

        if (updates.code !== undefined) {
            if (!updates.code?.trim()) {
                throw new DomainError('Role code cannot be empty', 400);
            }
            this.code = updates.code;
        }

        this.updateAuditDomain(audit_user_id);
    }
}

export type UserRoleProps = BaseDomainProps & {
    id: string;
    user_id: string;
    role_id: string;
};

export class UserRole extends BaseDomain {
    constructor(
        private id: string,
        private user_id: string,        
        private role_id: string,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
    }

    /**
     * Lấy toàn bộ dữ liệu UserRole dưới dạng DTO
     */
    getDTO(): UserRoleProps {
        return {
            id: this.id,
            user_id: this.user_id,
            role_id: this.role_id,
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
     * Getter - role_id
     */
    getRoleId(): string {
        return this.role_id;
    }

    /**
     * Tạo mới UserRole
     */
    static create(input: {
        audit_user_id: string;
        new_id: string;
        user_id: string;
        role_id: string;
    }): UserRole {
        const { audit_user_id, new_id, user_id, role_id } = input;

        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }
        if (!new_id?.trim()) {
            throw new DomainError('New ID is required', 400);
        }
        if (!user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!role_id?.trim()) {
            throw new DomainError('Role ID is required', 400);
        }

        const now = new Date();
        return new UserRole(new_id, user_id, role_id, now, audit_user_id, now, audit_user_id);
    }

    /**
     * Restore UserRole từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: UserRoleProps): UserRole {
        return new UserRole(
            data.id,
            data.user_id,
            data.role_id,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của UserRole
     */
    update(audit_user_id: string, updates: Partial<Omit<UserRoleProps, keyof BaseDomainProps | 'id'>>): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (updates.user_id !== undefined) {
            if (!updates.user_id?.trim()) {
                throw new DomainError('User ID cannot be empty', 400);
            }
            this.user_id = updates.user_id;
        }

        if (updates.role_id !== undefined) {
            if (!updates.role_id?.trim()) {
                throw new DomainError('Role ID cannot be empty', 400);
            }
            this.role_id = updates.role_id;
        }

        this.updateAuditDomain(audit_user_id);
    }
}
