import { redirect } from "next/navigation"
import { getCurrentUser } from "@/infrastructure/auth/prismaAuth"

export default async function Home() {
  const user = await getCurrentUser()
  if (user) redirect("/dashboard")
  redirect("/auth/login")
}
