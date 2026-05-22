import { z } from 'zod';
import { BaseDomain, baseSchema } from './BaseDomain';

export const vocabularySetSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    is_admin_set: z.boolean().default(false), // nếu là của admin thì nhiều user có thể dùng khi có tài khoản
    name: z.string().nonempty(),
    description: z.string().nullable(),
    is_published: z.boolean().default(false),
    published_at: z.date().nullable(),
    published_by: z.string().nullable(),
    ...baseSchema.shape,
});

export class VocabularySet extends BaseDomain {
    private domainProps: z.infer<typeof vocabularySetSchema>;
    constructor(inputProps: z.infer<typeof vocabularySetSchema>) {
        super(inputProps);
        const parsed = vocabularySetSchema.safeParse(inputProps);
        if (!parsed.success) {
            throw new Error('Invalid vocabulary set data');
        }
        this.domainProps = parsed.data;
    }

    getDTO(): z.infer<typeof vocabularySetSchema> {
        return this.domainProps;
    }

    createVocabularySet(
        audit_user_id: string,
        inputSet: z.infer<typeof vocabularySetSchema>,
    ) {
        super.createBaseDomain(audit_user_id);
        const merged = { ...inputSet, ...super.getDTO() };
        const parsed = vocabularySetSchema.safeParse(merged);
        if (!parsed.success) {
            throw new Error('Invalid vocabulary set data');
        }
        this.domainProps = parsed.data;
    }

    updateVocabularySet(
        audit_user_id: string,
        updates: Partial<z.infer<typeof vocabularySetSchema>>,
    ) {
        super.updateBaseDomain(audit_user_id);
        const newData = { ...this.domainProps, ...updates, ...super.getDTO() };
        const parsed = vocabularySetSchema.safeParse(newData);
        if (!parsed.success) {
            throw new Error('Invalid vocabulary set update data');
        }
        this.domainProps = parsed.data;
    }

    publish(audit_user_id: string, isPublished: boolean) {
        this.updateVocabularySet(audit_user_id, {
            is_published: isPublished,
            published_at: isPublished ? new Date() : null,
            published_by: isPublished ? audit_user_id : null,
        });
    }
}

// export interface VocabularySetProps {
//   id: string
//   userId: string
//   name: string
//   description: string | null
//   is_published: boolean
//   created_at: string
//   updated_at: string
// }

// export interface VocabularySetDTO {
//   id: string
//   user_id: string
//   name: string
//   description: string | null
//   is_published: boolean
//   created_at: string
//   updated_at: string
// }

// export class VocabularySet {
//   constructor(private readonly props: VocabularySetProps) {
//     if (!props.id) throw new Error("VocabularySet.id is required")
//     if (!props.userId) throw new Error("VocabularySet.userId is required")
//     if (!props.name?.trim()) throw new Error("VocabularySet.name is required")
//     if (!props.created_at) throw new Error("VocabularySet.created_at is required")
//     if (!props.updated_at) throw new Error("VocabularySet.updated_at is required")
//   }

//   isPublished() {
//     return this.props.is_published
//   }

//   toDTO(): VocabularySetDTO {
//     return {
//       id: this.props.id,
//       user_id: this.props.userId,
//       name: this.props.name,
//       description: this.props.description,
//       is_published: this.props.is_published,
//       created_at: this.props.created_at,
//       updated_at: this.props.updated_at,
//     }
//   }
// }
