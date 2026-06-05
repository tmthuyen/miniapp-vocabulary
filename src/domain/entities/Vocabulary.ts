import { BaseDomain, BaseDomainProps } from './BaseDomain';
import { DomainError } from '../exception/DomainError';

export type VocabularyDifficulty = 'Easy' | 'Medium' | 'Hard';

export type VocabularyProps = BaseDomainProps & {
    id: string;
    user_id: string;
    set_id: string | null;
    word: string;
    ipa: string | null;
    definition: string | null;
    example: string | null;
    category: string;
    difficulty: VocabularyDifficulty;
};

export class Vocabulary extends BaseDomain {
    constructor(
        private id: string,
        private user_id: string,
        private set_id: string | null,
        private word: string,
        private ipa: string | null,
        private definition: string | null,
        private example: string | null,
        private category: string,
        private difficulty: VocabularyDifficulty,
        created_at: Date | null,
        created_by: string | null,
        updated_at: Date | null,
        updated_by: string | null,
    ) {
        super(created_at, created_by, updated_at, updated_by);
        this.validate();
    }

    /**
     * Validate dữ liệu vocabulary
     */
    private validate(): void {
        if (!this.id?.trim()) {
            throw new DomainError('Vocabulary ID is required', 400);
        }
        if (!this.user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!this.word?.trim()) {
            throw new DomainError('Word is required', 400);
        }
        if (!this.category?.trim()) {
            throw new DomainError('Category is required', 400);
        }
        const validDifficulties: VocabularyDifficulty[] = ['Easy', 'Medium', 'Hard'];
        if (!validDifficulties.includes(this.difficulty)) {
            throw new DomainError('Invalid difficulty level', 400);
        }
    }

    /**
     * Lấy toàn bộ dữ liệu Vocabulary dưới dạng DTO
     */
    getDTO(): VocabularyProps {
        return {
            id: this.id,
            user_id: this.user_id,
            set_id: this.set_id,
            word: this.word,
            ipa: this.ipa,
            definition: this.definition,
            example: this.example,
            category: this.category,
            difficulty: this.difficulty,
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
     * Getter - set_id
     */
    getSetId(): string | null {
        return this.set_id;
    }

    /**
     * Getter - word
     */
    getWord(): string {
        return this.word;
    }

    /**
     * Getter - ipa
     */
    getIpa(): string | null {
        return this.ipa;
    }

    /**
     * Getter - definition
     */
    getDefinition(): string | null {
        return this.definition;
    }

    /**
     * Getter - example
     */
    getExample(): string | null {
        return this.example;
    }

    /**
     * Getter - category
     */
    getCategory(): string {
        return this.category;
    }

    /**
     * Getter - difficulty
     */
    getDifficulty(): VocabularyDifficulty {
        return this.difficulty;
    }

    /**
     * Tạo mới Vocabulary
     */
    static create(input: {
        audit_user_id: string;
        new_id: string;
        user_id: string;
        word: string;
        category: string;
        difficulty: VocabularyDifficulty;
        set_id?: string | null;
        ipa?: string | null;
        definition?: string | null;
        example?: string | null;
    }): Vocabulary {
        const {
            audit_user_id,
            new_id,
            user_id,
            word,
            category,
            difficulty,
            set_id = null,
            ipa = null,
            definition = null,
            example = null,
        } = input;

        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }
        if (!new_id?.trim()) {
            throw new DomainError('Vocabulary ID is required', 400);
        }
        if (!user_id?.trim()) {
            throw new DomainError('User ID is required', 400);
        }
        if (!word?.trim()) {
            throw new DomainError('Word is required', 400);
        }
        if (!category?.trim()) {
            throw new DomainError('Category is required', 400);
        }

        const now = new Date();
        return new Vocabulary(
            new_id,
            user_id,
            set_id ?? null,
            word,
            ipa ?? null,
            definition ?? null,
            example ?? null,
            category,
            difficulty,
            now,
            audit_user_id,
            now,
            audit_user_id,
        );
    }

    /**
     * Restore Vocabulary từ database (không validation, giữ nguyên audit trail)
     */
    static restore(data: VocabularyProps): Vocabulary {
        return new Vocabulary(
            data.id,
            data.user_id,
            data.set_id,
            data.word,
            data.ipa,
            data.definition,
            data.example,
            data.category,
            data.difficulty,
            data.created_at,
            data.created_by,
            data.updated_at,
            data.updated_by,
        );
    }

    /**
     * Cập nhật một vài hoặc toàn bộ thuộc tính của Vocabulary
     */
    update(
        audit_user_id: string,
        updates: Partial<Omit<VocabularyProps, keyof BaseDomainProps | 'id' | 'user_id'>>,
    ): void {
        if (!audit_user_id?.trim()) {
            throw new DomainError('Audit user ID is required', 400);
        }

        if (updates.word !== undefined) {
            if (!updates.word?.trim()) {
                throw new DomainError('Word cannot be empty', 400);
            }
            this.word = updates.word;
        }

        if (updates.category !== undefined) {
            if (!updates.category?.trim()) {
                throw new DomainError('Category cannot be empty', 400);
            }
            this.category = updates.category;
        }

        if (updates.difficulty !== undefined) {
            const validDifficulties: VocabularyDifficulty[] = ['Easy', 'Medium', 'Hard'];
            if (!validDifficulties.includes(updates.difficulty)) {
                throw new DomainError('Invalid difficulty level', 400);
            }
            this.difficulty = updates.difficulty;
        }

        if (updates.ipa !== undefined) {
            this.ipa = updates.ipa;
        }

        if (updates.definition !== undefined) {
            this.definition = updates.definition;
        }

        if (updates.example !== undefined) {
            this.example = updates.example;
        }

        if (updates.set_id !== undefined) {
            this.set_id = updates.set_id;
        }

        this.updateAuditDomain(audit_user_id);
    }

    /**
     * Cập nhật chi tiết từ vựng (IPA, định nghĩa, ví dụ)
     */
    updateDetails(
        audit_user_id: string,
        updates: {
            ipa?: string | null;
            definition?: string | null;
            example?: string | null;
        },
    ): void {
        this.update(audit_user_id, updates);
    }
}
