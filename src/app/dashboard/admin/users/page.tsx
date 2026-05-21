"use client"

import { useEffect, useMemo, useState } from "react"

type Row = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  target_band: number | null
  role: "admin" | "user"
  vip_plan: "free" | "vip_basic" | "vip_pro"
  vip_expired_at: string | null
  created_at: string
  updated_at: string
}

type SortField = "email" | "role" | "vip_plan" | "created_at" | "updated_at"

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | Row["role"]>("all")
  const [vipFilter, setVipFilter] = useState<"all" | Row["vip_plan"]>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? "Cannot load users")
      setRows(data)
      if (data.length && !selectedId) setSelectedId(data[0].id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const processed = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let list = rows.filter((r) => {
      const okQuery = !normalized || [r.email, r.full_name ?? "", r.id].some((x) => x.toLowerCase().includes(normalized))
      const okRole = roleFilter === "all" || r.role === roleFilter
      const okVip = vipFilter === "all" || r.vip_plan === vipFilter
      return okQuery && okRole && okVip
    })

    list = list.sort((a, b) => {
      const factor = sortDir === "asc" ? 1 : -1
      const av = a[sortField] ?? ""
      const bv = b[sortField] ?? ""
      if (av < bv) return -1 * factor
      if (av > bv) return 1 * factor
      return 0
    })

    return list
  }, [rows, query, roleFilter, vipFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = processed.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selected = rows.find((r) => r.id === selectedId) ?? null

  const patchLocal = (id: string, patch: Partial<Row>) => setRows((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  const callUpdate = async (row: Row, patch: Partial<Row>) => {
    setSavingId(row.id)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        role: patch.role ?? row.role,
        vip_plan: patch.vip_plan ?? row.vip_plan,
        vip_expired_at: patch.vip_expired_at !== undefined ? patch.vip_expired_at : row.vip_expired_at,
        full_name: (patch.full_name ?? row.full_name)?.trim() || null,
      }
      const res = await fetch(`/api/admin/users/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? "Update failed")
      patchLocal(row.id, data)
      setSuccess(`Updated ${row.email}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed")
    } finally {
      setSavingId(null)
    }
  }

  const quickSetVip = async (row: Row, vip: Row["vip_plan"]) => {
    const nextExpiry = vip === "free" ? null : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    await callUpdate(row, { vip_plan: vip, vip_expired_at: nextExpiry })
  }

  if (loading) return <div className="p-6">Loading users...</div>

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-bold">Admin User Management</h1>

    <div className="grid gap-2 md:grid-cols-6">
      <input className="rounded border p-2 md:col-span-2" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search email/name/id" />
      <select className="rounded border p-2" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as typeof roleFilter); setPage(1) }}><option value="all">All roles</option><option value="admin">admin</option><option value="user">user</option></select>
      <select className="rounded border p-2" value={vipFilter} onChange={(e) => { setVipFilter(e.target.value as typeof vipFilter); setPage(1) }}><option value="all">All VIP</option><option value="free">free</option><option value="vip_basic">vip_basic</option><option value="vip_pro">vip_pro</option></select>
      <select className="rounded border p-2" value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}><option value="created_at">created_at</option><option value="updated_at">updated_at</option><option value="email">email</option><option value="role">role</option><option value="vip_plan">vip_plan</option></select>
      <button className="rounded border p-2" onClick={() => setSortDir((prev) => prev === "asc" ? "desc" : "asc")}>{sortDir}</button>
    </div>

    {error ? <p className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
    {success ? <p className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">{success}</p> : null}

    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 overflow-auto rounded border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">VIP</th><th className="p-3">Updated</th><th className="p-3">Quick actions</th></tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className={`border-t ${selectedId === r.id ? "bg-gray-50" : ""}`}>
                <td className="p-3 cursor-pointer" onClick={() => setSelectedId(r.id)}><p className="font-medium">{r.email}</p><p className="text-xs text-gray-500">{r.full_name ?? "-"}</p></td>
                <td className="p-3"><select className="rounded border p-1" value={r.role} onChange={(e) => void callUpdate(r, { role: e.target.value as Row["role"] })} disabled={savingId === r.id}><option value="user">user</option><option value="admin">admin</option></select></td>
                <td className="p-3">{r.vip_plan}</td>
                <td className="p-3">{new Date(r.updated_at).toLocaleDateString()}</td>
                <td className="p-3"><div className="flex gap-1"><button className="rounded border px-2" onClick={() => void quickSetVip(r, "free")}>free</button><button className="rounded border px-2" onClick={() => void quickSetVip(r, "vip_basic")}>basic</button><button className="rounded border px-2" onClick={() => void quickSetVip(r, "vip_pro")}>pro</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded border p-3 space-y-2">
        <h2 className="font-semibold">User detail</h2>
        {!selected ? <p className="text-sm text-gray-500">Select a user</p> : <>
          <p><b>Email:</b> {selected.email}</p>
          <p><b>User ID:</b> {selected.id}</p>
          <p><b>Full name:</b> {selected.full_name ?? "-"}</p>
          <p><b>Avatar:</b> {selected.avatar_url ?? "-"}</p>
          <p><b>Target band:</b> {selected.target_band ?? "-"}</p>
          <p><b>Role:</b> {selected.role}</p>
          <p><b>VIP:</b> {selected.vip_plan}</p>
          <p><b>VIP expires:</b> {selected.vip_expired_at ? new Date(selected.vip_expired_at).toLocaleDateString() : "-"}</p>
          <p><b>Created:</b> {new Date(selected.created_at).toLocaleString()}</p>
          <p><b>Updated:</b> {new Date(selected.updated_at).toLocaleString()}</p>
        </>}
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <button className="rounded border px-2 py-1" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {safePage}/{totalPages}</span>
        <button className="rounded border px-2 py-1" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
      <select className="rounded border p-1" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
    </div>
  </div>
}
