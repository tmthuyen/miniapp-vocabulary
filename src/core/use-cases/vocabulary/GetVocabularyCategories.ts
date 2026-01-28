import type { IVocabularyRepository } from "@/core/interfaces/repositories/IVocabularyRepository"

export class GetVocabularyCategories {
  constructor(private readonly repo: IVocabularyRepository) {}

  async execute(userId: string): Promise<string[]> {
    if (!userId) throw new Error("userId is required")
    return this.repo.listCategoriesByUserId(userId)
  }
}


