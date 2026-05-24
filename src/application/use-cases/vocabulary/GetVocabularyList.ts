import type { IVocabularyRepository } from "@/domain/repositories/IVocabularyRepository"
import type { Vocabulary } from "@/domain/entities/Vocabulary"

export class GetVocabularyList {
  constructor(private readonly repo: IVocabularyRepository) {}

  async execute(userId: string): Promise<Vocabulary[]> {
    if (!userId) throw new Error("userId is required")
    return this.repo.listByUserId(userId)
  }
}


