import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type RoleProps = BaseDomainProps & {
    id: string;
    name: string;
    code: string;
};

export class Role extends BaseDomain {
    private domainProps: RoleProps;
    constructor(inputProps: RoleProps) {
        super(inputProps);
        if (!inputProps.id || !inputProps.name?.trim() || !inputProps.code?.trim()) {
            throw new Error('Invalid role data');
        }
        this.domainProps = { ...inputProps, code: inputProps.code.toUpperCase().trim() };
    }

    getDTO(): RoleProps {
        return this.domainProps;
    }
}

export type UserRoleProps = BaseDomainProps & {
    id: string;
    user_id: string;
    role_id: string;
};

export class UserRole extends BaseDomain {
    private domainProps: UserRoleProps;
    constructor(inputProps: UserRoleProps) {
        super(inputProps);
        if (!inputProps.id || !inputProps.user_id || !inputProps.role_id) {
            throw new Error('Invalid user role data');
        }
        this.domainProps = inputProps;
    }

    getDTO(): UserRoleProps {
        return this.domainProps;
    }

    static create(input: {
        audit_user_id: string;
        new_id: string;
        user_id: string;
        role_id: string;
    }): UserRole {
        if (!input.user_id || !input.role_id) {
            throw new DomainError('User ID and Role ID cannot be empty', 400);
        }
        const entity = new UserRole({
            id: input.new_id,
            user_id: input.user_id,
            role_id: input.role_id,
            created_at: null,
            created_by: null,
            updated_at: null,
            updated_by: null,
        });
        entity.createBaseDomain(input.audit_user_id);
        return entity;
    }
}
