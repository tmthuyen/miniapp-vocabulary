/**
 * Projection: Data structure for query results (Domain layer)
 * NOT a DTO - thuộc domain, không phụ thuộc application
 */
export class UserProfileWithRolesProjection {
    constructor(
        public id: string,
        public full_name: string,
        public avatar_url: string | null,
        public target_band: number | null,
        public vip_plan: string | null,
        public vip_expired_at: Date | null,
        public created_at: Date,
        public created_by: string,
        public updated_at: Date,
        public updated_by: string,
        public role_codes: string[],
    ) {}
}
