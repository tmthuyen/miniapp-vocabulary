import type { SupabaseClient } from "@supabase/supabase-js"
import { Vocabulary } from "@/core/domain/entities/Vocabulary"
import type {
  CreateVocabularyInput,
  IVocabularyRepository,
  UpdateVocabularyInput,
} from "@/core/interfaces/repositories/IVocabularyRepository"

type VocabularyRow = {
  id: string
  user_id: string
  word: string
  ipa: string | null
  definition: string | null
  example: string | null
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  created_at: string
}

function rowToEntity(row: VocabularyRow) {
  return new Vocabulary({
    id: row.id,
    userId: row.user_id,
    word: row.word,
    ipa: row.ipa,
    definition: row.definition,
    example: row.example,
    category: row.category,
    difficulty: row.difficulty,
    createdAt: row.created_at,
  })
}

export class SupabaseVocabularyRepository implements IVocabularyRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("vocabularies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data as VocabularyRow[] | null)?.map(rowToEntity) ?? []
  }

  async listCategoriesByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from("vocabularies")
      .select("category")
      .eq("user_id", userId)
      .not("category", "is", null)

    if (error) throw error

    const cats = (data as Array<{ category: string | null }> | null) ?? []
    return Array.from(new Set(cats.map((r) => r.category).filter(Boolean) as string[])).sort()
  }

  async createForUser(userId: string, input: CreateVocabularyInput) {
    const { data, error } = await this.supabase
      .from("vocabularies")
      .insert({
        user_id: userId,
        word: input.word,
        ipa: input.ipa ?? null,
        definition: input.definition ?? null,
        example: input.example ?? null,
        category: input.category,
        difficulty: input.difficulty,
      })
      .select("*")
      .single()

    if (error) throw error
    return rowToEntity(data as VocabularyRow)
  }

  async updateForUser(userId: string, id: string, input: UpdateVocabularyInput) {
    const { data, error } = await this.supabase
      .from("vocabularies")
      .update({
        ...(input.word !== undefined ? { word: input.word } : {}),
        ...(input.ipa !== undefined ? { ipa: input.ipa ?? null } : {}),
        ...(input.definition !== undefined ? { definition: input.definition ?? null } : {}),
        ...(input.example !== undefined ? { example: input.example ?? null } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single()

    if (error) throw error
    return rowToEntity(data as VocabularyRow)
  }

  async deleteForUser(userId: string, id: string) {
    const { error } = await this.supabase
      .from("vocabularies")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) throw error
  }
}


