import type { IVocabularyRepository } from "@/core/interfaces/repositories/IVocabularyRepository"
import type { Vocabulary } from "@/core/domain/entities/Vocabulary"

export class GetVocabularyList {
  constructor(private readonly repo: IVocabularyRepository) {}

  async execute(userId: string): Promise<Vocabulary[]> {
    if (!userId) throw new Error("userId is required")
    return this.repo.listByUserId(userId)
  }
}


