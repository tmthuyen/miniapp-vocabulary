import { parse } from "csv-parse/sync"
import { requireAdmin } from "@/infrastructure/api/next/requireUser"

function parseRows(csvText: string) {
  const records = parse(csvText, { columns: true, skip_empty_lines: true }) as any[]
  return records.map((r, index) => {
    const word = `${r.word ?? ""}`.trim()
    const category = `${r.category ?? "General"}`.trim() || "General"
    const difficulty = ["Easy", "Medium", "Hard"].includes(r.difficulty) ? r.difficulty : "Medium"
    return {
      line: index + 2,
      row: { word, ipa: r.ipa ?? null, definition: r.definition ?? null, example: r.example ?? null, category, difficulty, set_id: r.set_id ?? null },
      valid: Boolean(word),
      error: word ? null : "word is required",
    }
  })
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return Response.json({ message: auth.message }, { status: auth.status })

  const body = await req.json()
  const mode = body?.mode

  if (mode === "preview") {
    const previewRows = parseRows(`${body.csv ?? ""}`)
    return Response.json({ total: previewRows.length, valid: previewRows.filter((x) => x.valid).length, rows: previewRows })
  }

  if (mode === "commit") {
    const rows = Array.isArray(body?.rows) ? body.rows : []
    const created = []
    for (const r of rows) {
      if (!r?.word) continue
      const item = await auth.di.vocabulary.create.execute(auth.userId, {
        word: `${r.word}`,
        ipa: r.ipa ?? null,
        definition: r.definition ?? null,
        example: r.example ?? null,
        category: `${r.category ?? "General"}`,
        difficulty: (["Easy", "Medium", "Hard"].includes(r.difficulty) ? r.difficulty : "Medium") as any,
        setId: r.set_id ?? null,
      })
      created.push(item.toDTO())
    }
    return Response.json({ created_count: created.length })
  }

  return Response.json({ message: "Invalid mode" }, { status: 400 })
}
