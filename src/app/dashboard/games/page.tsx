"use client"

import { useEffect, useMemo, useState } from "react"

type Vocab = { id: string; word: string; definition?: string | null }
type Mode = "flashcard" | "quiz" | "fill" | "matching"
type History = {
  id: string
  mode: Mode
  score: number
  total_questions: number
  correct_answers: number
  started_at: string
  finished_at: string | null
}

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GamesPage() {
  const [items, setItems] = useState<Vocab[]>([])
  const [mode, setMode] = useState<Mode>("flashcard")
  const [allowed, setAllowed] = useState<{ [k in Mode]: boolean }>({ flashcard: true, quiz: true, fill: false, matching: false })
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [input, setInput] = useState("")
  const [selected, setSelected] = useState("")

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [history, setHistory] = useState<History[]>([])

  useEffect(() => {
    ;(async () => {
      const meRes = await fetch("/api/auth/me")
      const me = await meRes.json()
      const plan = me?.profile?.vip_plan ?? "free"
      setAllowed({
        flashcard: true,
        quiz: true,
        fill: plan === "vip_basic" || plan === "vip_pro",
        matching: plan === "vip_pro",
      })

      const res = await fetch("/api/vocabulary")
      const data = await res.json()
      setItems(data)

      const hRes = await fetch("/api/games/history")
      if (hRes.ok) setHistory(await hRes.json())
    })()
  }, [])

  const current = items[index]
  const normalized = (s: string) => s.trim().toLowerCase()

  const next = () => {
    setInput("")
    setShowAnswer(false)
    setSelected("")
    setIndex((v) => (items.length ? (v + 1) % items.length : 0))
  }

  const quizChoices = useMemo(() => {
    if (!current) return []
    const others = shuffle(items.filter((x) => x.id !== current.id)).slice(0, 3).map((x) => x.word)
    return shuffle([current.word, ...others])
  }, [items, current])

  const matchingPairs = useMemo(() => {
    const sample = shuffle(items.filter((i) => i.definition)).slice(0, 5)
    return {
      left: sample.map((s) => ({ id: s.id, word: s.word })),
      right: shuffle(sample.map((s) => ({ id: s.id, definition: s.definition || "" }))),
    }
  }, [items])

  const [pickWord, setPickWord] = useState<string | null>(null)
  const [pickDef, setPickDef] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())

  const startMatching = async () => {
    const r = await fetch("/api/games/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "matching", totalQuestions: matchingPairs.left.length }),
    })
    if (!r.ok) return
    const s = await r.json()
    setSessionId(s.id)
    setScore(0)
    setCorrect(0)
    setMatched(new Set())
  }

  const submitPair = async () => {
    if (!sessionId || !pickWord || !pickDef) return
    const expected = pickWord
    const submitted = pickDef

    const result = await fetch("/api/games/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, prompt: pickWord, expected, submitted }),
    }).then((r) => r.json())

    setScore(result.score)
    setCorrect(result.correctAnswers)

    const isCorrect = normalized(pickWord) === normalized(pickDef)
    if (isCorrect) {
      const n = new Set(matched)
      n.add(pickWord)
      setMatched(n)
    }

    setPickWord(null)
    setPickDef(null)
  }

  const finishMatching = async () => {
    if (!sessionId) return
    await fetch("/api/games/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    setSessionId(null)
    const hRes = await fetch("/api/games/history?mode=matching")
    if (hRes.ok) setHistory(await hRes.json())
  }

  if (!current) return <div className="p-6">Chua co tu vung de hoc.</div>

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Vocabulary Games</h1>
      <div className="flex gap-2 flex-wrap">
        {(["flashcard", "quiz", "fill", "matching"] as Mode[]).map((m) => (
          <button key={m} className={`rounded border px-3 py-2 ${mode === m ? "bg-black text-white" : ""}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      {!allowed[mode] && <div className="rounded border p-3">Che do nay can goi VIP cao hon.</div>}

      {allowed[mode] && mode === "flashcard" && (
        <div className="rounded-xl border p-4">
          <p>{showAnswer ? current.word : current.definition || "No definition"}</p>
          <div className="mt-2 flex gap-2">
            <button className="rounded border px-3 py-2" onClick={() => setShowAnswer((v) => !v)}>Show/Hide</button>
            <button className="rounded border px-3 py-2" onClick={next}>Next</button>
          </div>
        </div>
      )}

      {allowed[mode] && mode === "quiz" && (
        <div className="rounded-xl border p-4">
          <p>Definition: {current.definition || "No definition"}</p>
          <div className="mt-2 grid gap-2">{quizChoices.map((c) => <button key={c} className="rounded border p-2 text-left" onClick={() => setSelected(c)}>{c}</button>)}</div>
          {selected && <p className="mt-2">{selected === current.word ? "Correct" : `Wrong. Correct: ${current.word}`}</p>}
        </div>
      )}

      {allowed[mode] && mode === "fill" && (
        <div className="rounded-xl border p-4">
          <p>Definition: {current.definition || "No definition"}</p>
          <input className="mt-2 w-full rounded border p-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type the word" />
          {input && <p className="mt-2">{normalized(input) === normalized(current.word) ? "Correct" : "Try again"}</p>}
        </div>
      )}

      {allowed[mode] && mode === "matching" && (
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <button className="rounded border px-3 py-2" onClick={startMatching} disabled={!!sessionId}>Start</button>
            <button className="rounded border px-3 py-2" onClick={submitPair} disabled={!sessionId || !pickWord || !pickDef}>Submit Pair</button>
            <button className="rounded border px-3 py-2" onClick={finishMatching} disabled={!sessionId}>Finish</button>
            <p className="text-sm">Score: {score} | Correct: {correct}</p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-2">
              {matchingPairs.left.map((l) => (
                <button key={l.id} className={`w-full text-left rounded border p-2 ${pickWord === l.word ? "bg-black text-white" : ""} ${matched.has(l.word) ? "opacity-50" : ""}`} onClick={() => setPickWord(l.word)} disabled={matched.has(l.word)}>{l.word}</button>
              ))}
            </div>
            <div className="space-y-2">
              {matchingPairs.right.map((r) => (
                <button key={r.id} className={`w-full text-left rounded border p-2 ${pickDef === r.definition ? "bg-black text-white" : ""}`} onClick={() => setPickDef(r.definition)}>{r.definition}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border p-4">
        <h2 className="font-semibold mb-2">Recent History</h2>
        {history.length === 0 ? <p className="text-sm text-muted-foreground">No sessions yet.</p> : (
          <div className="space-y-1 text-sm">
            {history.slice(0, 10).map((h) => (
              <div key={h.id}>{h.mode} | score {h.score} | {h.correct_answers}/{h.total_questions}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
