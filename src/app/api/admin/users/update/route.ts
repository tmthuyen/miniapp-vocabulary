import { requireAdmin } from "@/infrastructure/api/next/requireUser"
import { toAppError } from "@/shared/errors/ErrorHandler"

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  try {
    const body = (await req.json()) as {
      id: string
      role?: "admin" | "user"
      vip_plan?: "free" | "vip_basic" | "vip_pro"
      vip_expired_at?: string | null
      full_name?: string | null
    }

    if (!body.id) return Response.json({ message: "id is required", code: "VALIDATION_ERROR" }, { status: 400 })

    const updated = await auth.di.admin.updateUserAccess.execute(body.id, body)
    return Response.json(updated)
  } catch (err) {
    const appErr = toAppError(err)
    return Response.json({ message: appErr.message, code: appErr.code }, { status: appErr.status })
  }
}
