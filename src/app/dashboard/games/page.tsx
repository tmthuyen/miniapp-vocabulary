"use client"

import { useEffect, useMemo, useState } from "react"

type Vocab = { id: string; word: string; definition?: string | null }

export default function GamesPage() {
  const [items, setItems] = useState<Vocab[]>([])
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [input, setInput] = useState("")

  useEffect(() => {
    fetch("/api/vocabulary").then(async (r) => setItems(await r.json()))
  }, [])

  const current = items[index]
  const normalized = (s: string) => s.trim().toLowerCase()
  const isCorrect = useMemo(() => {
    if (!current) return false
    return normalized(input) === normalized(current.word)
  }, [input, current])

  const next = () => {
    setInput("")
    setShowAnswer(false)
    setIndex((v) => (items.length ? (v + 1) % items.length : 0))
  }

  if (!current) return <div className="p-6">Chua co tu vung de choi game.</div>

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Vocabulary Games</h1>
      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">Flashcard</p>
        <p className="mt-2 text-lg">{showAnswer ? current.word : (current.definition || "No definition")}</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-black px-3 py-2 text-white" onClick={() => setShowAnswer((v) => !v)}>
            {showAnswer ? "Hide" : "Show answer"}
          </button>
          <button className="rounded border px-3 py-2" onClick={next}>Next</button>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">Typing game</p>
        <p className="mt-2">Definition: {current.definition || "No definition"}</p>
        <input
          className="mt-3 w-full rounded border p-2"
          placeholder="Type the correct word"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {input && <p className="mt-2 text-sm">{isCorrect ? "Correct" : "Try again"}</p>}
      </div>
    </div>
  )
}
