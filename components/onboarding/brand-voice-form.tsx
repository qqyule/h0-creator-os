"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BrandVoice } from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

export function BrandVoiceForm({ brandVoice }: { brandVoice?: BrandVoice }) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setMessage(null)

    startTransition(async () => {
      const traits = String(formData.get("traits") ?? "")
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8)
      const examples = [0, 1, 2]
        .map((index) => ({
          title: String(formData.get(`exampleTitle${index}`) ?? "").trim(),
          text: String(formData.get(`exampleText${index}`) ?? "").trim(),
          approved: formData.get(`approved${index}`) === "on",
        }))
        .filter((example) => example.title && example.text)

      const response = await fetch("/api/v1/brand-voice", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ traits, examples }),
      })
      const result = (await response.json()) as ApiResult<{ brandVoice: BrandVoice; mode: string }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? "Brand Voice could not be saved.")
        return
      }

      setMessage(`Brand Voice saved in ${result.data.mode} mode.`)
    })
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 shadow-sm" noValidate>
      <h2 className="text-base font-semibold text-foreground">Brand Voice</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Store bounded traits and approved snippets for server-side rewrite prompts.
      </p>
      <label htmlFor="brand-traits" className="mt-4 block text-sm font-medium text-foreground">Voice traits</label>
      <textarea
        id="brand-traits"
        name="traits"
        rows={4}
        defaultValue={brandVoice?.traits.join("\n")}
        placeholder="Clear, practical, operator-led"
        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
      />
      <div className="mt-4 grid gap-3">
        {[0, 1, 2].map((index) => {
          const example = brandVoice?.examples[index]
          return (
            <div key={index} className="rounded-xl border border-border bg-background p-3">
              <input
                name={`exampleTitle${index}`}
                defaultValue={example?.title}
                maxLength={120}
                placeholder={`Reference title ${index + 1}`}
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
              <textarea
                name={`exampleText${index}`}
                defaultValue={example?.text}
                maxLength={800}
                rows={3}
                placeholder="Paste a short approved example, not a full article."
                className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" name={`approved${index}`} defaultChecked={example?.approved ?? true} />
                Approved for AI rewrite context
              </label>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {message ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {message}
          </p>
        ) : <span />}
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Save Brand Voice
        </Button>
      </div>
    </form>
  )
}
