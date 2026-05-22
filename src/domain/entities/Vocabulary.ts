import { z } from 'zod';
import { BaseDomain, baseSchema } from './BaseDomain';

export type VocabularyDifficulty = 'Easy' | 'Medium' | 'Hard';

export const vocabularySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  set_id: z.string().nullable(),
  word: z.string().nonempty(),
  ipa: z.string().nullable(),
  definition: z.string().nullable(),
  example: z.string().nullable(),
  category: z.string().nonempty(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  ...baseSchema.shape,
});

export class Vocabulary extends BaseDomain {
  private domainProps: z.infer<typeof vocabularySchema>;
  constructor(inputProps: z.infer<typeof vocabularySchema>) {
    super(inputProps);
    const parsed = vocabularySchema.safeParse(inputProps);
    if (!parsed.success) {
      throw new Error('Invalid vocabulary data');
    }
    this.domainProps = parsed.data;
  }

  getDTO(): z.infer<typeof vocabularySchema> {
    return this.domainProps;
  }

  createVocabulary(
    audit_user_id: string,
    inputVocab: z.infer<typeof vocabularySchema>,
  ) {
    super.createBaseDomain(audit_user_id);
    const merged = { ...inputVocab, ...super.getDTO() };
    const parsed = vocabularySchema.safeParse(merged);
    if (!parsed.success) {
      throw new Error('Invalid vocabulary data');
    }
    this.domainProps = parsed.data;
  }

  updateVocabulary(
    audit_user_id: string,
    updates: Partial<z.infer<typeof vocabularySchema>>,
  ) {
    super.updateBaseDomain(audit_user_id);
    const newData = { ...this.domainProps, ...updates, ...super.getDTO() };
    const parsed = vocabularySchema.safeParse(newData);

    if (!parsed.success) {
      throw new Error('Invalid vocabulary update data');
    }
    this.domainProps = parsed.data;
  }
}
