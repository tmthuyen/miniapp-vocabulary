import { BaseDomain, BaseDomainProps } from './BaseDomain';

export type VipPlan = 'free' | 'vip_basic' | 'vip_pro';
export type UserStatus =
    | 'pending'
    | 'active'
    | 'inactive'
    | 'deleted'
    | 'banned'
    | 'restricted';

export type UserProfileProps = BaseDomainProps & {
    id: string;
    full_name: string;
    status: UserStatus;
    avatar_url: string | null;
    target_band: number | null;
    vip_plan: VipPlan;
    vip_expired_at: Date | null;
};

export class UserProfile extends BaseDomain {
    private domainProps: UserProfileProps;
    constructor(inputProps: UserProfileProps) {
        super(inputProps);
        if (!inputProps.id || !inputProps.full_name?.trim()) {
            throw new Error('Invalid user profile data');
        }
        this.domainProps = inputProps;
    }

    getDTO(): UserProfileProps {
        return this.domainProps;
    }

    static create(input: {
        audit_user_id: string;
        new_id: string;
        full_name: string;
        avatar_url?: string | null;
        target_band?: number | null;
    }): UserProfile {
        const entity = new UserProfile({
            id: input.new_id,
            full_name: input.full_name,
            status: 'pending',
            avatar_url: input.avatar_url ?? null,
            target_band: input.target_band ?? null,
            vip_plan: 'free',
            vip_expired_at: null,
            created_at: null,
            created_by: null,
            updated_at: null,
            updated_by: null,
        });

        entity.createBaseDomain(input.audit_user_id);

        return entity;
    }

    update(audit_user_id: string, updates: Partial<UserProfileProps>) {
        this.updateBaseDomain(audit_user_id);
        this.domainProps = { ...this.domainProps, ...updates, ...super.getDTO() };
    }

    changeVipPlan(
        audit_user_id: string,
        newPlan: VipPlan,
        vip_expired_at: Date | null,
    ) {
        this.update(audit_user_id, { vip_plan: newPlan, vip_expired_at });
    }

    changeStatus(audit_user_id: string, newStatus: UserStatus) {
        this.update(audit_user_id, { status: newStatus });
    }
}
