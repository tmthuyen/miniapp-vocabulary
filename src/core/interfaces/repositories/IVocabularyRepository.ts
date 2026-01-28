import type { Vocabulary, VocabularyDifficulty } from "@/core/domain/entities/Vocabulary"

export interface CreateVocabularyInput {
  word: string
  ipa?: string | null
  definition?: string | null
  example?: string | null
  category: string
  difficulty: VocabularyDifficulty
}

export interface UpdateVocabularyInput {
  word?: string
  ipa?: string | null
  definition?: string | null
  example?: string | null
  category?: string
  difficulty?: VocabularyDifficulty
}

export interface IVocabularyRepository {
  listByUserId(userId: string): Promise<Vocabulary[]>
  listCategoriesByUserId(userId: string): Promise<string[]>
  createForUser(userId: string, input: CreateVocabularyInput): Promise<Vocabulary>
  updateForUser(userId: string, id: string, input: UpdateVocabularyInput): Promise<Vocabulary>
  deleteForUser(userId: string, id: string): Promise<void>
}


