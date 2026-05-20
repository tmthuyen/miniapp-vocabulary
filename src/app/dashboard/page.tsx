"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { VocabularyList, AddVocabularyDialog } from "@/presentation/components/features/vocabulary"

interface VocabularyStats { totalToday: number; totalAllTime: number }

export default function DashboardPage() {
  const [stats, setStats] = useState<VocabularyStats>({ totalToday: 0, totalAllTime: 0 })
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const meRes = await fetch("/api/auth/me")
      const me = await meRes.json()
      if (!me?.user) {
        router.push("/auth/login")
        return
      }

      const res = await fetch("/api/vocabulary")
      if (!res.ok) throw new Error("Failed to load vocabularies")
      const list = (await res.json()) as Array<{ created_at: string }>
      const today = new Date(); today.setHours(0,0,0,0)
      setStats({ totalAllTime: list.length, totalToday: list.filter((v) => new Date(v.created_at) >= today).length })
    } finally { setLoading(false) }
  }

  return <div className="space-y-8">{/* unchanged layout */}
    <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-muted-foreground mt-1">Track your vocabulary learning progress</p></div><Button onClick={() => setAddDialogOpen(true)} className="gap-2" size="lg"><Plus className="h-5 w-5" />Quick Add</Button></div>
    <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Words Learned Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{loading ? "..." : stats.totalToday}</div><CardDescription className="mt-1">Keep up the great work!</CardDescription></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Words</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{loading ? "..." : stats.totalAllTime}</div><CardDescription className="mt-1">Your vocabulary collection</CardDescription></CardContent></Card></div>
    <div><h2 className="text-2xl font-bold mb-4">Your Vocabulary</h2><VocabularyList onUpdate={loadStats} /></div>
    <AddVocabularyDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={loadStats} />
  </div>
}
