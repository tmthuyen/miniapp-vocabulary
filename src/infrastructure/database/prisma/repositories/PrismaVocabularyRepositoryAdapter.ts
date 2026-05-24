// import { Vocabulary } from "@/domain/entities/Vocabulary"
// import type {
//   CreateVocabularyInput,
//   CreateVocabularySetInput,
//   IVocabularyRepository,
//   UpdateVocabularyInput,
// } from "@/domain/repositories/IVocabularyRepository"
// import { prisma } from "@/infrastructure/database/prisma/client" 

// function toEntity(row: any): Vocabulary {
//   return new Vocabulary({
//     id: row.id,
//     userId: row.user_id,
//     setId: row.set_id,
//     word: row.word,
//     ipa: row.ipa,
//     definition: row.definition,
//     example: row.example,
//     category: row.category,
//     difficulty: row.difficulty,
//     createdAt: row.created_at.toISOString(),
//   })
// }

// function toSetDTO(row: any) {
//   return {
//     id: row.id,
//     name: row.name,
//     description: row.description,
//     is_published: row.is_published,
//     created_at: row.created_at.toISOString(),
//     updated_at: row.updated_at.toISOString(),
//   }
// }

// export class PrismaVocabularyRepository implements IVocabularyRepository {
//   async listByUserId(userId: string) {
//     const rows = await prisma.vocabulary.findMany({ where: { user_id: userId }, orderBy: { created_at: "desc" } })
//     return rows.map((user) => toEntity(user))
//   }

//   async listCategoriesByUserId(userId: string) {
//     const rows = await prisma.vocabulary.findMany({ where: { user_id: userId }, select: { category: true } })
//     return Array.from(new Set(rows.map((r) => r.category))).sort()
//   }

//   async createForUser(userId: string, input: CreateVocabularyInput) {
//     const row = await prisma.vocabulary.create({ data: { user_id: userId, set_id: input.setId ?? null, ...input } })
//     return toEntity(row)
//   }

//   async updateForUser(userId: string, id: string, input: UpdateVocabularyInput) {
//     const data: any = { ...input }
//     if (Object.prototype.hasOwnProperty.call(input, "setId")) data.set_id = input.setId
//     delete data.setId

//     const updated = await prisma.vocabulary.updateMany({ where: { id, user_id: userId }, data })
//     if (updated.count === 0) throw new Error("Vocabulary not found")
//     const row = await prisma.vocabulary.findUnique({ where: { id } })
//     if (!row || row.user_id !== userId) throw new Error("Vocabulary not found")
//     return toEntity(row)
//   }

//   async deleteForUser(userId: string, id: string) {
//     await prisma.vocabulary.deleteMany({ where: { id, user_id: userId } })
//   }

//   async listSetsByUserId(userId: string) {
//     const rows = await prisma.vocabularySet.findMany({ where: { user_id: userId }, orderBy: { updated_at: "desc" } })
//     return rows.map(toSetDTO)
//   }

//   async listPublishedSets() {
//     const rows = await prisma.vocabularySet.findMany({ where: { is_published: true }, orderBy: { updated_at: "desc" } })
//     return rows.map(toSetDTO)
//   }

//   async createSetForUser(userId: string, input: CreateVocabularySetInput) {
//     const row = await prisma.vocabularySet.create({ data: { user_id: userId, name: input.name, description: input.description ?? null } })
//     return toSetDTO(row)
//   }

//   async publishSetForUser(userId: string, setId: string, isPublished: boolean) {
//     const updated = await prisma.vocabularySet.updateMany({
//       where: { id: setId, user_id: userId },
//       data: { is_published: isPublished },
//     })
//     if (updated.count === 0) throw new Error("Vocabulary set not found")
//     const row = await prisma.vocabularySet.findUnique({ where: { id: setId } })
//     if (!row || row.user_id !== userId) throw new Error("Vocabulary set not found")
//     return toSetDTO(row)
//   }
// }

