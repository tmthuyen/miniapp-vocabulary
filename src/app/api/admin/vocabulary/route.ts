import { parse } from "csv-parse/sync"
import { requireAdmin } from "@/infrastructure/api/next/requireUser"
import type { CreateVocabularyInput } from "@/domain/repositories/IVocabularyRepository"

function normalizeRecord(record: any): CreateVocabularyInput {
  return {
    word: `${record.word ?? ""}`.trim(),
    ipa: record.ipa ? `${record.ipa}` : null,
    definition: record.definition ? `${record.definition}` : null,
    example: record.example ? `${record.example}` : null,
    category: `${record.category ?? "General"}`.trim() || "General",
    difficulty: (["Easy", "Medium", "Hard"].includes(record.difficulty) ? record.difficulty : "Medium") as any,
    setId: record.set_id ? `${record.set_id}` : null,
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const list = await auth.di.vocabulary.getList.execute(auth.userId)
  return Response.json(list.map((v) => v.toDTO()))
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = (await req.json()) as Partial<CreateVocabularyInput>
  const created = await auth.di.vocabulary.create.execute(auth.userId, normalizeRecord(body))
  return Response.json(created.toDTO())
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = await req.json()
  const rows = Array.isArray(body?.rows) ? body.rows : []
  const created = []
  for (const row of rows) {
    const item = normalizeRecord(row)
    if (!item.word) continue
    const record = await auth.di.vocabulary.create.execute(auth.userId, item)
    created.push(record.toDTO())
  }
  return Response.json({ created_count: created.length, rows: created })
}
