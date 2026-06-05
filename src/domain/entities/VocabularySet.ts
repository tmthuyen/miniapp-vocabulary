import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type VocabularySetProps = BaseDomainProps & {
    id: string;
    user_id: string;
    is_admin_set: boolean;
    name: string;
    description: string | null;
    is_published: boolean;
    published_at: Date | null;
    published_by: string | null;
};

export class VocabularySet extends BaseDomain {
    constructor(
        private id: string,
        private user_id: string,
        private is_admin_set: boolean,
        private name: string,
        private description: string | null,
        private is_published: boolean,
        private published_at: Date | null,
        private published_by: string | null,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
        this.validate();
    }

    /**
     * Validate dữ liệu vocabulary set
     */
    private validate(): void {
        if (!this.id?.trim()) {
            throw new DomainError('Vocabulary set ID is required', 400);
        }
        if (!this.user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!this.name?.trim()) {
            throw new DomainError('Name is required', 400);
        }
    }

    /**
     * Lấy toàn bộ dữ liệu VocabularySet dưới dạng DTO
     */
    getDTO(): VocabularySetProps {
        return {
            id: this.id,
            user_id: this.user_id,
            is_admin_set: this.is_admin_set,
            name: this.name,
            description: this.description,
            is_published: this.is_published,
            published_at: this.published_at,
            published_by: this.published_by,
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
     * Getter - is_admin_set
     */
    isAdminSet(): boolean {
        return this.is_admin_set;
    }

    /**
     * Getter - name
     */
    getName(): string {
        return this.name;
    }

    /**
     * Getter - description
     */
    getDescription(): string | null {
        return this.description;
    }

    /**
     * Getter - is_published
     */
    isPublished(): boolean {
        return this.is_published;
    }

    /**
     * Getter - published_at
     */
    getPublishedAt(): Date | null {
        return this.published_at;
    }

    /**
     * Getter - published_by
     */
    getPublishedBy(): string | null {
        return this.published_by;
    }

    /**
     * Tạo mới VocabularySet
     */
    static create(input: {
        audit_user_id: string;
        new_id: string;
        user_id: string;
        name: string;
        description?: string | null;
        is_admin_set?: boolean;
    }): VocabularySet {
        const {
            audit_user_id,
            new_id,
            user_id,
            name,
            description = null,
            is_admin_set = false,
        } = input;

        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }
        if (!new_id?.trim()) {
            throw new DomainError('Vocabulary set ID is required', 400);
        }
        if (!user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!name?.trim()) {
            throw new DomainError('Name is required', 400);
        }

        const now = new Date();
        return new VocabularySet(
            new_id,
            user_id,
            is_admin_set,
            name,
            description ?? null,
            false,
            null,
            null,
            now,
            audit_user_id,
            now,
            audit_user_id,
        );
    }

    /**
     * Restore VocabularySet từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: VocabularySetProps): VocabularySet {
        return new VocabularySet(
            data.id,
            data.user_id,
            data.is_admin_set,
            data.name,
            data.description,
            data.is_published,
            data.published_at,
            data.published_by,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của VocabularySet
     */
    update(
        audit_user_id: string,
        updates: Partial<Omit<VocabularySetProps, keyof BaseDomainProps | 'id' | 'user_id' | 'is_admin_set' | 'is_published' | 'published_at' | 'published_by'>>,
    ): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (updates.name !== undefined) {
            if (!updates.name?.trim()) {
                throw new DomainError('Name cannot be empty', 400);
            }
            this.name = updates.name;
        }

        if (updates.description !== undefined) {
            this.description = updates.description;
        }

        this.updateAuditDomain(audit_user_id);
    }

    /**
     * Publish hoặc unpublish vocabulary set
     */
    setPublished(audit_user_id: string, isPublished: boolean): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (this.is_published === isPublished) {
            throw new DomainError(
                `Vocabulary set is already ${isPublished ? 'published' : 'unpublished'}`,
                400,
            );
        }

        this.is_published = isPublished;
        this.published_at = isPublished ? new Date() : null;
        this.published_by = isPublished ? audit_user_id : null;

        this.updateAuditDomain(audit_user_id);
    }

    /**
     * Publish vocabulary set
     */
    publish(audit_user_id: string): void {
        this.setPublished(audit_user_id, true);
    }

    /**
     * Unpublish vocabulary set
     */
    unpublish(audit_user_id: string): void {
        this.setPublished(audit_user_id, false);
    }

    /**
     * Cập nhật thông tin cơ bản (name, description)
     */
    updateBasicInfo(
        audit_user_id: string,
        updates: {
            name?: string;
            description?: string | null;
        },
    ): void {
        this.update(audit_user_id, updates);
    }
}
