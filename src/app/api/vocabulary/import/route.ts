import { parse } from "csv-parse/sync"
import { requireAdmin } from "@/infrastructure/api/next/requireUser"
import type { CreateVocabularyInput } from "@/domain/repositories/IVocabularyRepository"

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = await req.text()
  const records: Array<Partial<CreateVocabularyInput>> = parse(body, {
    columns: true,
    skip_empty_lines: true,
  })

  const createdVocabularies = []
  for (const record of records) {
    const created = await auth.di.vocabulary.create.execute(auth.userId, {
      word: record.word ?? "",
      ipa: record.ipa ?? null,
      definition: record.definition ?? null,
      example: record.example ?? null,
      category: record.category ?? "General",
      difficulty: (record.difficulty as "Easy" | "Medium" | "Hard") ?? "Medium",
    })
    createdVocabularies.push(created.toDTO())
  }

  return Response.json(createdVocabularies)
}
