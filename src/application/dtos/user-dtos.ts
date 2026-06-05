import { VipPlan } from "@/domain/entities/UserProfile";

export class UserProfileResponseDTO {
    constructor(
        public readonly id: string,
        public readonly full_name: string,
        public readonly avatar_url: string | null,
        public readonly vip_plan: VipPlan,
        public readonly vip_expired_at: Date | null,
        public readonly created_at: Date | null,
        public readonly created_by: string | null,
        public readonly updated_at: Date | null,
        public readonly updated_by: string | null,
    ) {}
}

// with roles
export class UserProfileWithRolesResponseDTO extends UserProfileResponseDTO {
    constructor(
        id: string,
        full_name: string,
        avatar_url: string | null,
        vip_plan: VipPlan,
        vip_expired_at: Date | null,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
        public readonly role_codes: string[],
    ) {
        super(id, full_name, avatar_url, vip_plan, vip_expired_at, created_at, created_by, updated_at, updated_by);
    }

}

// with auth providers
export class UserProfileWithAuthProvidersResponseDTO extends UserProfileResponseDTO {
    constructor(
        id: string,
        full_name: string,
        avatar_url: string | null,
        vip_plan: VipPlan,
        vip_expired_at: Date | null,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
        public readonly auth_providers: { provider_type: string; email: string | null }[],
    ) {
        super(id, full_name, avatar_url, vip_plan, vip_expired_at, created_at, created_by, updated_at, updated_by);
    }
}

// with sessions

// with vocab
