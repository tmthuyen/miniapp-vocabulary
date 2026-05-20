import { Vocabulary } from "@/core/domain/entities/Vocabulary"
import type {
  CreateVocabularyInput,
  IVocabularyRepository,
  UpdateVocabularyInput,
} from "@/core/interfaces/repositories/IVocabularyRepository"
import { prisma } from "@/infrastructure/database/prisma/client"

function toEntity(row: any) {
  return new Vocabulary({
    id: row.id,
    userId: row.user_id,
    word: row.word,
    ipa: row.ipa,
    definition: row.definition,
    example: row.example,
    category: row.category,
    difficulty: row.difficulty,
    createdAt: row.created_at.toISOString(),
  })
}

export class PrismaVocabularyRepository implements IVocabularyRepository {
  async listByUserId(userId: string) {
    const rows = await prisma.vocabulary.findMany({ where: { user_id: userId }, orderBy: { created_at: "desc" } })
    return rows.map(toEntity)
  }

  async listCategoriesByUserId(userId: string) {
    const rows = await prisma.vocabulary.findMany({ where: { user_id: userId }, select: { category: true } })
    return Array.from(new Set(rows.map((r) => r.category))).sort()
  }

  async createForUser(userId: string, input: CreateVocabularyInput) {
    const row = await prisma.vocabulary.create({ data: { user_id: userId, ...input } })
    return toEntity(row)
  }

  async updateForUser(userId: string, id: string, input: UpdateVocabularyInput) {
    const updated = await prisma.vocabulary.updateMany({ where: { id, user_id: userId }, data: input as any })
    if (updated.count === 0) throw new Error("Vocabulary not found")
    const row = await prisma.vocabulary.findUnique({ where: { id } })
    if (!row || row.user_id !== userId) throw new Error("Vocabulary not found")
    return toEntity(row)
  }

  async deleteForUser(userId: string, id: string) {
    await prisma.vocabulary.deleteMany({ where: { id, user_id: userId } })
  }
}
