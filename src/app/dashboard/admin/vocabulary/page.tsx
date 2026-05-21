"use client"

import { useEffect, useState } from "react"

export default function AdminVocabularyPage() {
  const [rows, setRows] = useState<any[]>([])
  const [sets, setSets] = useState<any[]>([])
  const [csv, setCsv] = useState("")
  const [preview, setPreview] = useState<any[]>([])

  const load = async () => {
    const [v, s] = await Promise.all([fetch("/api/admin/vocabulary"), fetch("/api/admin/vocabulary/sets")])
    setRows(await v.json())
    setSets(await s.json())
  }
  useEffect(() => { void load() }, [])

  const createQuick = async () => {
    await fetch("/api/admin/vocabulary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ word: "new word", category: "General", difficulty: "Medium" }) })
    await load()
  }

  const doPreview = async () => {
    const res = await fetch("/api/admin/vocabulary/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "preview", csv }) })
    const data = await res.json()
    setPreview(data.rows ?? [])
  }

  const doCommit = async () => {
    await fetch("/api/admin/vocabulary/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "commit", rows: preview.filter((x) => x.valid).map((x) => x.row) }) })
    setPreview([])
    setCsv("")
    await load()
  }

  const createSet = async () => {
    const name = prompt("Set name")
    if (!name) return
    await fetch("/api/admin/vocabulary/sets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    await load()
  }

  const togglePublish = async (setId: string, next: boolean) => {
    await fetch("/api/admin/vocabulary/sets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish", set_id: setId, is_published: next }) })
    await load()
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-bold">Admin Vocabulary</h1>
    <div className="flex gap-2">
      <button className="rounded border px-3 py-2" onClick={() => void createQuick()}>Quick add</button>
      <button className="rounded border px-3 py-2" onClick={() => void createSet()}>New set</button>
    </div>
    <div className="rounded border p-3 space-y-2">
      <h2 className="font-semibold">CSV import preview/batch</h2>
      <textarea className="w-full min-h-[140px] rounded border p-2" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="word,ipa,definition,example,category,difficulty,set_id" />
      <div className="flex gap-2"><button className="rounded border px-3 py-1" onClick={() => void doPreview()}>Preview</button><button className="rounded border px-3 py-1" onClick={() => void doCommit()} disabled={!preview.length}>Commit valid rows</button></div>
    </div>
    <div className="rounded border p-3">
      <h2 className="font-semibold">Vocabulary Sets (publish)</h2>
      <div className="space-y-1">{sets.map((s) => <div key={s.id} className="flex items-center justify-between border-b py-1"><span>{s.name} ({s.is_published ? "published" : "draft"})</span><button className="rounded border px-2" onClick={() => void togglePublish(s.id, !s.is_published)}>{s.is_published ? "Unpublish" : "Publish"}</button></div>)}</div>
    </div>
    <div className="rounded border p-3">
      <h2 className="font-semibold">Vocabulary ({rows.length})</h2>
      <div className="max-h-72 overflow-auto space-y-1">{rows.map((r) => <div key={r.id} className="flex items-center justify-between border-b py-1"><span>{r.word} - {r.category}</span><button className="rounded border px-2" onClick={async () => { await fetch(`/api/admin/vocabulary/item`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) }); await load() }}>Delete</button></div>)}</div>
    </div>
  </div>
}

