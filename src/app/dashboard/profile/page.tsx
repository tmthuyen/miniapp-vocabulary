"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { routes } from "@/shared/constants/routes"
import { useRouter } from "next/navigation" 

type ProfileDTO = {
  id: string
  full_name: string | null
  avatar_url: string | null
  target_band: number | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null)
  const [fullName, setFullName] = useState("")
  const [targetBand, setTargetBand] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile")
        if (res.status === 401) {
          router.push(routes.login)
          return
        }
        if (!res.ok) throw new Error("Failed to load profile")
        const data = (await res.json()) as ProfileDTO
        setProfile(data)
        setFullName(data.full_name ?? "")
        setTargetBand(data.target_band?.toString() ?? "")
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load profile"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim() || null,
          target_band: targetBand.trim() ? Number(targetBand) : null,
        }),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      const updated = (await res.json()) as ProfileDTO
      setProfile(updated)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save profile"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal info and learning target</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target band</label>
            <Input
              value={targetBand}
              onChange={(e) => setTargetBand(e.target.value)}
              placeholder="e.g., 7.5"
              inputMode="decimal"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            {profile?.updated_at && (
              <div className="text-sm text-muted-foreground self-center">
                Last updated: {new Date(profile.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


