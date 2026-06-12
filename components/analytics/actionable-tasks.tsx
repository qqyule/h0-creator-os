"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { CreatorTask } from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

export function ActionableTasksPanel({ month, initialTasks }: { month: string; initialTasks: CreatorTask[] }) {
  const t = useTranslations("analytics.tasks")
  const [tasks, setTasks] = useState(initialTasks)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function generateTasks() {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch("/api/v1/analytics/insights/actionable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ month }),
      })
      const result = (await response.json()) as ApiResult<{
        generation: { data: CreatorTask[]; source: "openai" | "fallback"; warning?: string }
        saved: { tasks: CreatorTask[] }
      }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? t("errors.generateFailed"))
        return
      }

      setTasks(result.data.saved.tasks)
      setMessage(result.data.generation.warning ?? t("messages.generated", { source: result.data.generation.source }))
    })
  }

  function toggleTask(task: CreatorTask) {
    startTransition(async () => {
      const nextStatus = task.status === "done" ? "open" : "done"
      const response = await fetch(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const result = (await response.json()) as ApiResult<{ task: CreatorTask }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? t("errors.updateFailed"))
        return
      }

      setTasks((current) => current.map((item) => (item.id === task.id ? result.data!.task : item)))
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={generateTasks} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          {t("generate")}
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        {tasks.length ? (
          tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t("due", { date: task.dueDate })}</p>
                </div>
                <Button
                  variant={task.status === "done" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleTask(task)}
                  disabled={isPending}
                >
                  <CheckCircle2 data-icon="inline-start" />
                  {task.status === "done" ? t("done") : t("markDone")}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="font-medium text-foreground">{t("empty.title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
          </div>
        )}
      </div>

      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
    </section>
  )
}
