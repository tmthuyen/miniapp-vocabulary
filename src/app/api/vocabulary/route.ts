import type { CreateVocabularyInput } from "@/core/interfaces/repositories/IVocabularyRepository"

export async function GET() {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  const list = await di.vocabulary.getList.execute(user.id)

  return Response.json(list.map((v) => v.toDTO()))
}

export async function POST(req: Request) {
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  const body = (await req.json()) as Partial<CreateVocabularyInput>

  const created = await di.vocabulary.create.execute(user.id, {
    word: body.word ?? "",
    ipa: body.ipa ?? null,
    definition: body.definition ?? null,
    example: body.example ?? null,
    category: body.category ?? "General",
    difficulty: (body.difficulty as any) ?? "Medium",
  })

  return Response.json(created.toDTO())
}


