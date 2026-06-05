import AppError from "@/shared/errors/AppError";

export type BaseDomainProps = {
    created_at: Date | null;
    created_by: string | null;
    updated_at: Date | null;
    updated_by: string | null;
};

export class BaseDomain {
    constructor(
        protected createdAt: Date | null,
        protected createdBy: string | null,
        protected updatedAt: Date | null,
        protected updatedBy: string | null,
    ) {
    }

    /**
     * Lấy DTO chứa audit information
     */
    getBaseDomainDTO(): BaseDomainProps {
        return {
            created_at: this.createdAt,
            created_by: this.createdBy,
            updated_at: this.updatedAt,
            updated_by: this.updatedBy,
        };
    }

    /**
     * Getter - created_at
     */
    getCreatedAt(): Date | null {
        return this.createdAt;
    }

    /**
     * Getter - created_by
     */
    getCreatedBy(): string | null {
        return this.createdBy;
    }

    /**
     * Getter - updated_at
     */
    getUpdatedAt(): Date | null {
        return this.updatedAt;
    }

    /**
     * Getter - updated_by
     */
    getUpdatedBy(): string | null {
        return this.updatedBy;
    }

    /**
     * Tạo audit domain mới với giá trị mặc định
     */
    static createBaseDomain(audit_user_id: string) {
        if (!audit_user_id?.trim()) {
            throw AppError.builder()                
                .withPublicMessage('Invalid audit user id')
                .withCode('INVALID_INPUT')
                .withStatus(400);
        }
        const now = new Date();
        return new BaseDomain(now, audit_user_id, now, audit_user_id);
    }

    /**
     * Cập nhật audit domain - thay đổi updated_at và updated_by
     */
    protected updateAuditDomain(audit_user_id: string) {
        if (!audit_user_id?.trim()) {
            throw AppError.builder()                
                .withPublicMessage('Invalid audit user id')
                .withCode('INVALID_INPUT')
                .withStatus(400);
        }
        
        this.updatedAt = new Date();
        this.updatedBy = audit_user_id;
    }
}
