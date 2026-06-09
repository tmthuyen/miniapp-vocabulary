"use client"

import { useEffect, useState } from "react"
import { routes } from "@/shared/constants/routes"
import { useRouter } from "next/navigation"
import { EditProfileForm } from "./ProfileForm"
import { ProfileDTO } from "@/shared/types/user.types"
import { getProfile } from "@/infrastructure/api/profile-api"
import { toast } from "sonner"

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const res = await getProfile()
      if (!res.success || !res.data) {
        if (res.status === 401) {
          router.push(routes.login)
          return
        }

        setProfile(null)
        setLoading(false)
        toast.error("Failed to load profile: " + res.message, { duration: 5000, position: "top-right" })

        return;
      }

      setLoading(false)
      setProfile(res.data)
    }
    load()
  }, [router])

  if (loading) {
    return <div className="text-muted-foreground">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <EditProfileForm profile={profile} />
    </div>
  )
}


