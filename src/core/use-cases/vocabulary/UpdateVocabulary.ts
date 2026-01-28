import type { IVocabularyRepository, UpdateVocabularyInput } from "@/core/interfaces/repositories/IVocabularyRepository"
import type { Vocabulary } from "@/core/domain/entities/Vocabulary"

export class UpdateVocabulary {
  constructor(private readonly repo: IVocabularyRepository) {}

  async execute(userId: string, id: string, input: UpdateVocabularyInput): Promise<Vocabulary> {
    if (!userId) throw new Error("userId is required")
    if (!id) throw new Error("id is required")

    const normalized: UpdateVocabularyInput = { ...input }
    if (typeof normalized.word === "string") normalized.word = normalized.word.trim()
    if (typeof normalized.category === "string") normalized.category = normalized.category.trim()

    if (normalized.word !== undefined && !normalized.word) throw new Error("word is required")
    if (normalized.category !== undefined && !normalized.category) throw new Error("category is required")

    return this.repo.updateForUser(userId, id, normalized)
  }
}


