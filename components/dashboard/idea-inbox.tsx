"use client"

import { useState, useTransition } from "react"
import { Archive, CheckCircle2, Loader2, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { Idea, PlatformId } from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

export function IdeaInbox({ initialIdeas }: { initialIdeas: Idea[] }) {
  const t = useTranslations("ideaInbox")
  const [ideas, setIdeas] = useState(initialIdeas)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function createIdea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget
    setMessage(null)

    startTransition(async () => {
      const response = await fetch("/api/v1/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          platform: String(formData.get("platform") || "") || undefined,
        }),
      })
      const result = (await response.json()) as ApiResult<{ idea: Idea }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? t("errors.createFailed"))
        return
      }

      setIdeas((current) => [result.data!.idea, ...current])
      form.reset()
      setMessage(t("messages.created"))
    })
  }

  function updateIdea(idea: Idea, status: Idea["status"]) {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch("/api/v1/ideas", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: idea.id, status }),
      })
      const result = (await response.json()) as ApiResult<{ idea: Idea }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? t("errors.updateFailed"))
        return
      }

      setIdeas((current) => current.map((item) => (item.id === idea.id ? result.data!.idea : item)))
    })
  }

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <form onSubmit={createIdea} className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-3" noValidate>
        <input
          name="title"
          required
          maxLength={180}
          placeholder={t("fields.title")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        <textarea
          name="description"
          required
          maxLength={600}
          rows={3}
          placeholder={t("fields.description")}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <select name="platform" className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
            <option value="">{t("fields.noPlatform")}</option>
            {(["linkedin", "x", "youtube", "rednote"] as PlatformId[]).map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
            {t("create")}
          </Button>
        </div>
      </form>

      <div className="mt-4 grid gap-3">
        {ideas.length ? ideas.slice(0, 5).map((idea) => (
          <div key={idea.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{idea.title}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{idea.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{idea.source} · {idea.status}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" size="icon-sm" variant="outline" disabled={isPending} onClick={() => updateIdea(idea, "planned")} aria-label={t("markPlanned")}>
                  <CheckCircle2 />
                </Button>
                <Button type="button" size="icon-sm" variant="outline" disabled={isPending} onClick={() => updateIdea(idea, "archived")} aria-label={t("archive")}>
                  <Archive />
                </Button>
              </div>
            </div>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        )}
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
    </section>
  )
}
