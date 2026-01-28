import { describe, expect, it } from "vitest"
import { CreateVocabulary } from "@/core/use-cases/vocabulary/CreateVocabulary"
import type { IVocabularyRepository } from "@/core/interfaces/repositories/IVocabularyRepository"
import { Vocabulary } from "@/core/domain/entities/Vocabulary"

const makeRepo = (): IVocabularyRepository => ({
  listByUserId: async () => [],
  listCategoriesByUserId: async () => [],
  createForUser: async (userId, input) =>
    new Vocabulary({
      id: "id-1",
      userId,
      word: input.word,
      ipa: input.ipa ?? null,
      definition: input.definition ?? null,
      example: input.example ?? null,
      category: input.category,
      difficulty: input.difficulty,
      createdAt: new Date().toISOString(),
    }),
  updateForUser: async () => {
    throw new Error("not implemented")
  },
  deleteForUser: async () => {},
})

describe("CreateVocabulary", () => {
  it("trims word and category", async () => {
    const uc = new CreateVocabulary(makeRepo())
    const created = await uc.execute("user-1", {
      word: "  hello  ",
      category: "  General ",
      difficulty: "Medium",
      ipa: null,
      definition: null,
      example: null,
    })
    expect(created.toDTO().word).toBe("hello")
    expect(created.toDTO().category).toBe("General")
  })

  it("throws if word empty", async () => {
    const uc = new CreateVocabulary(makeRepo())
    await expect(
      uc.execute("user-1", {
        word: "   ",
        category: "General",
        difficulty: "Medium",
        ipa: null,
        definition: null,
        example: null,
      })
    ).rejects.toThrow("word is required")
  })
})


