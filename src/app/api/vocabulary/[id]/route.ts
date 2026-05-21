import { requireAdmin, requireUser } from "@/infrastructure/api/next/requireUser"
import type { UpdateVocabularyInput } from "@/core/interfaces/repositories/IVocabularyRepository"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const { id } = await params
  const body = (await req.json()) as UpdateVocabularyInput
  const updated = await auth.di.vocabulary.update.execute(auth.userId, id, body)
  return Response.json(updated.toDTO())
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(req, ctx)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const { id } = await params
  await auth.di.vocabulary.delete.execute(auth.userId, id)
  return Response.json({ ok: true })
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const { id } = await params
  const list = await auth.di.vocabulary.getList.execute(auth.userId)
  const found = list.find((v) => v.toDTO().id === id)
  if (!found) return Response.json({ message: "Not found" }, { status: 404 })
  return Response.json(found.toDTO())
}
