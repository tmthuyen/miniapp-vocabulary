import { createUserByAdmin } from "@/infrastructure/auth/prismaAuth"
import { requireAdmin } from "@/infrastructure/api/next/requireUser"
import { isEmail } from "@/shared/utils/validation"
import { toAppError } from "@/shared/errors/ErrorHandler"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  try {
    const users = await auth.di.admin.listUsers.execute()
    return Response.json(users)
  } catch (err) {
    const appErr = toAppError(err)
    return Response.json({ message: appErr.message, code: appErr.code }, { status: appErr.status })
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  try {
    const body = (await req.json()) as {
      email?: string
      password?: string
      full_name?: string | null
      role?: "admin" | "user"
      vip_plan?: "free" | "vip_basic" | "vip_pro"
      vip_expired_at?: string | null
    }

    const email = body.email?.trim().toLowerCase() ?? ""
    const password = body.password ?? ""

    if (!isEmail(email)) return Response.json({ message: "Invalid email", code: "VALIDATION_ERROR" }, { status: 400 })
    if (password.length < 8) return Response.json({ message: "Password must be at least 8 characters", code: "VALIDATION_ERROR" }, { status: 400 })

    const created = await createUserByAdmin({
      email,
      password,
      full_name: body.full_name ?? null,
      role: body.role,
      vip_plan: body.vip_plan,
      vip_expired_at: body.vip_expired_at,
    })

    return Response.json(created, { status: 201 })
  } catch (err) {
    const appErr = toAppError(err)
    const status = appErr.message.toLowerCase().includes("unique") || appErr.message.toLowerCase().includes("exists") ? 409 : appErr.status
    return Response.json({ message: status === 409 ? "Email already exists" : appErr.message, code: appErr.code }, { status })
  }
}
