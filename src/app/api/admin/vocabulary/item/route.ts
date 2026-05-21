import { requireAdmin } from "@/infrastructure/api/next/requireUser"
import type { UpdateVocabularyInput } from "@/core/interfaces/repositories/IVocabularyRepository"

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const body = await req.json()
  const id = `${body?.id ?? ""}`
  const patch = (body?.patch ?? {}) as UpdateVocabularyInput
  const updated = await auth.di.vocabulary.update.execute(auth.userId, id, patch)
  return Response.json(updated.toDTO())
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })
  const body = await req.json()
  await auth.di.vocabulary.delete.execute(auth.userId, `${body?.id ?? ""}`)
  return Response.json({ ok: true })
}
