import type { Vocabulary, VocabularyDifficulty } from "@/domain/entities/Vocabulary"

export interface CreateVocabularyInput {
  word: string
  ipa?: string | null
  definition?: string | null
  example?: string | null
  category: string
  difficulty: VocabularyDifficulty
  setId?: string | null
}

export interface UpdateVocabularyInput {
  word?: string
  ipa?: string | null
  definition?: string | null
  example?: string | null
  category?: string
  difficulty?: VocabularyDifficulty
  setId?: string | null
}

export interface CreateVocabularySetInput {
  name: string
  description?: string | null
}

export interface VocabularySetDTO {
  id: string
  name: string
  description?: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface IVocabularyRepository {
  listByUserId(userId: string): Promise<Vocabulary[]>
  listCategoriesByUserId(userId: string): Promise<string[]>
  createForUser(userId: string, input: CreateVocabularyInput): Promise<Vocabulary>
  updateForUser(userId: string, id: string, input: UpdateVocabularyInput): Promise<Vocabulary>
  deleteForUser(userId: string, id: string): Promise<void>

  listSetsByUserId(userId: string): Promise<VocabularySetDTO[]>
  createSetForUser(userId: string, input: CreateVocabularySetInput): Promise<VocabularySetDTO>
  publishSetForUser(userId: string, setId: string, isPublished: boolean): Promise<VocabularySetDTO>
}

