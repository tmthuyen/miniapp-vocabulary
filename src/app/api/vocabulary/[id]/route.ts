import type { UpdateVocabularyInput } from "@/core/interfaces/repositories/IVocabularyRepository"

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  const body = (await req.json()) as Partial<UpdateVocabularyInput>
  const updated = await di.vocabulary.update.execute(user.id, id, body)

  return Response.json(updated.toDTO())
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { createNextRouteContainer } = await import("@/infrastructure/di/nextRouteContainer")
  const di = await createNextRouteContainer()
  const user = await di.auth.getCurrentUser.execute()
  if (!user) return Response.json({ message: "Unauthorized" }, { status: 401 })

  await di.vocabulary.delete.execute(user.id, id)

  return Response.json({ ok: true })
}


