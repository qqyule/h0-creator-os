"use client"

import { useState, useTransition } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { Insight } from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

export function InsightGenerator({ month }: { month: string }) {
  const t = useTranslations("insightGenerator")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [insight, setInsight] = useState<Insight | null>(null)

  function generate() {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch("/api/v1/analytics/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ month }),
      })
      const result = (await response.json()) as ApiResult<{
        generation: { data: Insight; source: "openai" | "fallback"; warning?: string }
      }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? t("errors.generateFailed"))
        return
      }

      setInsight(result.data.generation.data)
      setMessage(result.data.generation.warning ?? t("messages.generated", { source: result.data.generation.source }))
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={generate} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          {t("generate")}
        </Button>
      </div>
      {insight ? (
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <p className="font-medium text-foreground">{insight.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.summary}</p>
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
    </section>
  )
}
