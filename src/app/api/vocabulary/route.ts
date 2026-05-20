import { requireAdmin, requireUser } from "@/infrastructure/api/next/requireUser"
import type { CreateVocabularyInput } from "@/core/interfaces/repositories/IVocabularyRepository"

export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const list = await auth.di.vocabulary.getList.execute(auth.userId)
  return Response.json(list.map((v) => v.toDTO()))
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = (await req.json()) as Partial<CreateVocabularyInput>
  const created = await auth.di.vocabulary.create.execute(auth.userId, {
    word: body.word ?? "",
    ipa: body.ipa ?? null,
    definition: body.definition ?? null,
    example: body.example ?? null,
    category: body.category ?? "General",
    difficulty: (body.difficulty as any) ?? "Medium",
  })

  return Response.json(created.toDTO())
}
