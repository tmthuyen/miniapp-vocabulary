import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type VipPlan = 'free' | 'vip_basic' | 'vip_pro';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'deleted' | 'banned' | 'restricted';

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
    constructor(
        private id: string,
        private full_name: string,
        private status: UserStatus,
        private avatar_url: string | null,
        private target_band: number | null,
        private vip_plan: VipPlan,
        private vip_expired_at: Date | null,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
    }

    /**
     * Lấy toàn bộ dữ liệu UserProfile dưới dạng DTO
     */
    getDTO(): UserProfileProps {
        return {
            id: this.id,
            full_name: this.full_name,
            status: this.status,
            avatar_url: this.avatar_url,
            target_band: this.target_band,
            vip_plan: this.vip_plan,
            vip_expired_at: this.vip_expired_at,
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
     * Getter - full_name
     */
    getFullName(): string {
        return this.full_name;
    }

    /**
     * Getter - status
     */
    getStatus(): UserStatus {
        return this.status;
    }

    /**
     * Getter - avatar_url
     */
    getAvatarUrl(): string | null {
        return this.avatar_url;
    }

    /**
     * Getter - target_band
     */
    getTargetBand(): number | null {
        return this.target_band;
    }

    /**
     * Getter - vip_plan
     */
    getVipPlan(): VipPlan {
        return this.vip_plan;
    }

    /**
     * Getter - vip_expired_at
     */
    getVipExpiredAt(): Date | null {
        return this.vip_expired_at;
    }

    /**
     * Kiểm tra VIP có hết hạn hay không
     */
    isVipExpired(now: Date = new Date()): boolean {
        if (!this.vip_expired_at) {
            return false;
        }
        return this.vip_expired_at <= now;
    }

    /**
     * Tạo mới UserProfile
     */
    static create(input: {
        audit_user_id: string;
        new_id: string;
        full_name: string;
        avatar_url?: string | null;
        target_band?: number | null;
    }): UserProfile {
        const { audit_user_id, new_id, full_name, avatar_url = null, target_band = null } = input;

        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }
        if (!new_id?.trim()) {
            throw new DomainError('User profile ID is required', 400);
        }
        if (!full_name?.trim()) {
            throw new DomainError('Full name is required', 400);
        }

        const now = new Date();
        return new UserProfile(
            new_id,
            full_name,
            'pending',
            avatar_url ?? null,
            target_band ?? null,
            'free',
            null,
            now,
            audit_user_id,
            now,
            audit_user_id,
        );
    }

    /**
     * Restore UserProfile từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: UserProfileProps): UserProfile {
        return new UserProfile(
            data.id,
            data.full_name,
            data.status,
            data.avatar_url,
            data.target_band,
            data.vip_plan,
            data.vip_expired_at,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của UserProfile
     */
    update(
        audit_user_id: string,
        updates: Partial<Omit<UserProfileProps, keyof BaseDomainProps | 'id'>>,
    ): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (updates.full_name !== undefined) {
            if (!updates.full_name?.trim()) {
                throw new DomainError('Full name cannot be empty', 400);
            }
            this.full_name = updates.full_name;
        }

        if (updates.status !== undefined) {
            this.status = updates.status;
        }

        if (updates.avatar_url !== undefined) {
            this.avatar_url = updates.avatar_url;
        }

        if (updates.target_band !== undefined) {
            this.target_band = updates.target_band;
        }

        if (updates.vip_plan !== undefined) {
            this.vip_plan = updates.vip_plan;
        }

        if (updates.vip_expired_at !== undefined) {
            this.vip_expired_at = updates.vip_expired_at;
        }

        this.updateAuditDomain(audit_user_id);
    }

    /**
     * Thay đổi VIP plan và thời gian hết hạn
     */
    changeVipPlan(
        audit_user_id: string,
        newPlan: VipPlan,
        vip_expired_at: Date | null,
    ): void {
        this.update(audit_user_id, { vip_plan: newPlan, vip_expired_at });
    }

    /**
     * Thay đổi trạng thái user
     */
    changeStatus(audit_user_id: string, newStatus: UserStatus): void {
        this.update(audit_user_id, { status: newStatus });
    }

    /**
     * Thay đổi thông tin cơ bản
     */
    updateBasicInfo(
        audit_user_id: string,
        updates: {
            full_name?: string;
            avatar_url?: string | null;
            target_band?: number | null;
        },
    ): void {
        this.update(audit_user_id, updates);
    }
}
