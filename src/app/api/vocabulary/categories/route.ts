import { requireUser } from "@/infrastructure/api/next/requireUser"

export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const categories = await auth.di.vocabulary.getCategories.execute(auth.userId)
  return Response.json({ categories })
}


