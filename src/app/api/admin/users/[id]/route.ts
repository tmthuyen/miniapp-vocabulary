import { banUserByAdmin, deleteUserByAdmin } from "@/infrastructure/auth/prismaAuth"
import { requireAdmin } from "@/infrastructure/api/next/requireUser"
import { toAppError } from "@/shared/errors/ErrorHandler"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  try {
    const { id } = await params
    const body = (await req.json()) as {
      role?: "admin" | "user"
      vip_plan?: "free" | "vip_basic" | "vip_pro"
      vip_expired_at?: string | null
      full_name?: string | null
    }

    if (id === auth.userId && body.role === "user") {
      return Response.json({ message: "You cannot downgrade your own admin role", code: "FORBIDDEN_SELF_DEMOTE" }, { status: 400 })
    }

    const updated = await auth.di.admin.updateUserAccess.execute(id, body)
    return Response.json(updated)
  } catch (err) {
    const appErr = toAppError(err)
    return Response.json({ message: appErr.message, code: appErr.code }, { status: appErr.status })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  try {
    const { id } = await params
    if (id === auth.userId) return Response.json({ message: "Cannot delete current admin account" }, { status: 400 })
    await deleteUserByAdmin(id)
    return Response.json({ ok: true })
  } catch (err) {
    const appErr = toAppError(err)
    return Response.json({ message: appErr.message, code: appErr.code }, { status: appErr.status })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  try {
    const { id } = await params
    if (id === auth.userId) return Response.json({ message: "Cannot ban current admin account" }, { status: 400 })

    const body = (await req.json()) as { action?: string }
    if (body.action !== "ban") return Response.json({ message: "Unsupported action" }, { status: 400 })

    await banUserByAdmin(id)
    await auth.di.admin.updateUserAccess.execute(id, { role: "user", vip_plan: "free", vip_expired_at: null })

    return Response.json({ ok: true })
  } catch (err) {
    const appErr = toAppError(err)
    return Response.json({ message: appErr.message, code: appErr.code }, { status: appErr.status })
  }
}
