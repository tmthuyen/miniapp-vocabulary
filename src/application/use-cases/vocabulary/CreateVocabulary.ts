import type { IVocabularyRepository, CreateVocabularyInput } from "@/domain/repositories/IVocabularyRepository"
import type { Vocabulary } from "@/domain/entities/Vocabulary"

export class CreateVocabulary {
  constructor(private readonly repo: IVocabularyRepository) {}

  async execute(userId: string, input: CreateVocabularyInput): Promise<Vocabulary> {
    if (!userId) throw new Error("userId is required")
    if (!input.word?.trim()) throw new Error("word is required")
    if (!input.category?.trim()) throw new Error("category is required")
    return this.repo.createForUser(userId, {
      ...input,
      word: input.word.trim(),
      category: input.category.trim(),
    })
  }
}


