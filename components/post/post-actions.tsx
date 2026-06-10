"use client"

import { useState, useTransition } from "react"
import { AlertCircle, CheckCircle2, Loader2, PenLine, Save, Sparkles } from "lucide-react"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import {
  platformLabels,
  workflowStatuses,
  type PlatformId,
  type PlatformVariant,
  type Post,
  type PostMetric,
} from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

export function RewritePanel({
  post,
  initialVariants,
}: {
  post: Post
  initialVariants: PlatformVariant[]
}) {
  const [variants, setVariants] = useState(initialVariants)
  const [platform, setPlatform] = useState<PlatformId>(post.primaryPlatform)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const activeVariant = variants.find((variant) => variant.platform === platform)

  function generateRewrite() {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/rewrite`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform }),
      })
      const result = (await response.json()) as ApiResult<{
        generation: { data: PlatformVariant; source: "openai" | "fallback"; warning?: string }
      }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? "Rewrite could not be generated.")
        return
      }

      setVariants((current) => [
        ...current.filter((variant) => variant.platform !== platform),
        result.data!.generation.data,
      ])
      setMessage(result.data.generation.warning ?? `Rewrite generated with ${result.data.generation.source}.`)
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Platform Rewrite</h2>
          <p className="mt-1 text-sm text-muted-foreground">Adapt the same idea for each channel without changing the source post.</p>
        </div>
        <Button onClick={generateRewrite} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          Generate rewrite
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.platforms.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPlatform(item)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              platform === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            }`}
          >
            {platformLabels[item]}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        {activeVariant ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PlatformPill platform={activeVariant.platform} />
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                {activeVariant.characterCount} characters
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{activeVariant.headline}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{activeVariant.body}</p>
            <p className="mt-4 text-sm font-medium text-foreground">{activeVariant.callToAction}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="font-medium text-foreground">No rewrite for this platform yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Generate a validated variant to keep it tied to this post.</p>
          </div>
        )}
      </div>

      {message ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
          <span>{message}</span>
        </div>
      ) : null}
    </section>
  )
}

export function StatusPanel({ post }: { post: Post }) {
  const [status, setStatus] = useState(post.status)
  const [version, setVersion] = useState(post.version)
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateStatus(nextStatus: Post["status"]) {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus, version }),
      })
      const result = (await response.json()) as ApiResult<{ post: Post }>

      if (!result.ok || !result.data) {
        setMessage({ tone: "error", text: result.error?.message ?? "Status could not be updated." })
        return
      }

      setStatus(result.data.post.status)
      setVersion(result.data.post.version)
      setMessage({ tone: "success", text: "Status update accepted through the server boundary." })
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Workflow Status</h2>
          <p className="mt-1 text-sm text-muted-foreground">Version {version}; status writes use conflict-aware payloads.</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {workflowStatuses.map((item) => (
          <Button
            key={item}
            type="button"
            variant={item === status ? "default" : "outline"}
            disabled={isPending}
            onClick={() => updateStatus(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      {message ? (
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
            message.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      ) : null}
    </section>
  )
}

export function MetricEntryPanel({ post, initialMetrics }: { post: Post; initialMetrics: PostMetric[] }) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const payload = {
        postId: post.id,
        platform: post.primaryPlatform,
        views: Number(formData.get("views") ?? 0),
        likes: Number(formData.get("likes") ?? 0),
        comments: Number(formData.get("comments") ?? 0),
        saves: Number(formData.get("saves") ?? 0),
        followersGained: Number(formData.get("followersGained") ?? 0),
      }
      const response = await fetch("/api/v1/metrics/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as ApiResult<{ metric: PostMetric; mode: string }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? "Metric could not be saved.")
        return
      }

      setMetrics((current) => [result.data!.metric, ...current])
      setMessage(`Metric saved in ${result.data.mode} mode.`)
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">Manual Metrics</h2>
      <form action={onSubmit} className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="views" label="Views" defaultValue={5200} />
          <NumberField name="likes" label="Likes" defaultValue={260} />
          <NumberField name="comments" label="Comments" defaultValue={32} />
          <NumberField name="saves" label="Saves" defaultValue={61} />
          <NumberField name="followersGained" label="Followers gained" defaultValue={11} />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Save metrics
        </Button>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <div className="mt-4 grid gap-2">
        {metrics.length ? (
          metrics.slice(0, 3).map((metric) => (
            <div key={`${metric.postId}-${metric.publishedAt}`} className="rounded-lg border border-border bg-background p-3 text-sm">
              <span className="font-medium text-foreground">{metric.views.toLocaleString()} views</span>
              <span className="text-muted-foreground"> · {metric.likes} likes · {metric.saves} saves</span>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No metrics recorded for this post yet.
          </div>
        )}
      </div>
    </section>
  )
}

export function DraftPanel({ post }: { post: Post }) {
  const [message, setMessage] = useState<string | null>(null)
  const [draft, setDraft] = useState(post.draft)
  const [isPending, startTransition] = useTransition()

  function generateDraft() {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/draft`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform: post.primaryPlatform }),
      })
      const result = (await response.json()) as ApiResult<{ generation: { data: { body: string; version: number }; warning?: string } }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? "Draft could not be generated.")
        return
      }

      setDraft(result.data.generation.data.body)
      setMessage(result.data.generation.warning ?? `Draft version ${result.data.generation.data.version} generated.`)
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">Draft</h2>
        <Button type="button" variant="outline" disabled={isPending} onClick={generateDraft}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <PenLine data-icon="inline-start" />}
          Generate draft
        </Button>
      </div>
      <p className="mt-4 whitespace-pre-line rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
        {draft}
      </p>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </section>
  )
}

function NumberField({ name, label, defaultValue }: { name: string; label: string; defaultValue: number }) {
  return (
    <label className="text-sm font-medium text-foreground">
      {label}
      <input
        name={name}
        type="number"
        min="0"
        defaultValue={defaultValue}
        className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
      />
    </label>
  )
}
