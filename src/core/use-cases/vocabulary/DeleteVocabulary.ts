import type { IVocabularyRepository } from "@/core/interfaces/repositories/IVocabularyRepository"

export class DeleteVocabulary {
  constructor(private readonly repo: IVocabularyRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    if (!userId) throw new Error("userId is required")
    if (!id) throw new Error("id is required")
    return this.repo.deleteForUser(userId, id)
  }
}


