"use client"

import { useState, useTransition } from "react"
import { AlertCircle, CheckCircle2, Loader2, PenLine, RefreshCw, Save, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { PlatformPill } from "@/components/app/platform-pill"
import { StatusBadge } from "@/components/app/status-badge"
import { VisualMockupWorkspace } from "@/components/post/mockup-preview"
import { Button } from "@/components/ui/button"
import {
  platformLabels,
  toneSandboxOptions,
  workflowStatuses,
  type PlatformId,
  type PlatformVariant,
  type Post,
  type PostMetric,
  type ToneSandbox,
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
  const t = useTranslations("postActions.rewrite")
  const [variants, setVariants] = useState(initialVariants)
  const [platform, setPlatform] = useState<PlatformId>(post.primaryPlatform)
  const [message, setMessage] = useState<string | null>(null)
  const [hookMessage, setHookMessage] = useState<string | null>(null)
  const [hooks, setHooks] = useState<string[]>([])
  const [tone, setTone] = useState<ToneSandbox>("Analytic")
  const [isPending, startTransition] = useTransition()
  const [isHookPending, startHookTransition] = useTransition()
  const activeVariant = variants.find((variant) => variant.platform === platform)

  function updateVariant(variant: PlatformVariant) {
    setVariants((current) => [
      ...current.filter((item) => item.platform !== variant.platform),
      variant,
    ])
  }

  function selectPlatform(nextPlatform: PlatformId) {
    setPlatform(nextPlatform)
    setHooks([])
    setHookMessage(null)
  }

  function generateRewrite(toneOverride?: ToneSandbox) {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/rewrite`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform, tone: toneOverride }),
      })
      const result = (await response.json()) as ApiResult<{
        generation: { data: PlatformVariant; source: "openai" | "fallback"; warning?: string }
      }>

      if (!result.ok || !result.data) {
        setMessage(result.error?.message ?? t("errors.generateFailed"))
        return
      }

      updateVariant(result.data.generation.data)
      setMessage(result.data.generation.warning ?? t("messages.generated", { source: result.data.generation.source }))
    })
  }

  function generateHooks() {
    setHookMessage(null)
    startHookTransition(async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/rewrite/hook`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform, body: activeVariant?.body }),
      })
      const result = (await response.json()) as ApiResult<{
        hooks: string[]
        source: "openai" | "fallback"
        warning?: string
      }>

      if (!result.ok || !result.data) {
        setHookMessage(result.error?.message ?? t("hook.errors.generateFailed"))
        return
      }

      setHooks(result.data.hooks.slice(0, 3))
      setHookMessage(result.data.warning ?? t("hook.messages.generated", { source: result.data.source }))
    })
  }

  function applyHook(hook: string) {
    if (!activeVariant) {
      return
    }

    const nextBody = replaceOpening(activeVariant.body, hook)
    updateVariant({
      ...activeVariant,
      body: nextBody,
      characterCount: nextBody.length,
      status: "edited",
      updatedAt: new Date().toISOString(),
    })
    setHookMessage(t("hook.messages.applied"))
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => generateRewrite()} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          {t("generate")}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("platformGroup")}>
        {post.platforms.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={platform === item}
            onClick={() => selectPlatform(item)}
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
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <PlatformPill platform={activeVariant.platform} />
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {t("characterCount", { count: activeVariant.characterCount })}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{activeVariant.headline}</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{activeVariant.body}</p>
              <p className="mt-4 text-sm font-medium text-foreground">{activeVariant.callToAction}</p>

              <div className="mt-5 grid gap-4 border-t border-border pt-4">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{t("hook.title")}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{t("hook.description")}</p>
                    </div>
                    <Button type="button" variant="outline" disabled={isHookPending} onClick={generateHooks}>
                      {isHookPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
                      {t("hook.generate")}
                    </Button>
                  </div>
                  {hooks.length ? (
                    <div className="mt-3 grid gap-2">
                      {hooks.map((hook) => (
                        <button
                          key={hook}
                          type="button"
                          onClick={() => applyHook(hook)}
                          className="rounded-xl border border-border bg-card p-3 text-left text-sm leading-6 text-foreground transition hover:bg-accent focus:outline-none focus:ring-3 focus:ring-ring/20"
                        >
                          {hook}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {hookMessage ? <p className="mt-3 text-sm text-muted-foreground" role="status">{hookMessage}</p> : null}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">{t("tone.title")}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{t("tone.description")}</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="sr-only" htmlFor={`tone-${post.id}-${platform}`}>
                      {t("tone.selectLabel")}
                    </label>
                    <select
                      id={`tone-${post.id}-${platform}`}
                      value={tone}
                      onChange={(event) => setTone(event.target.value as ToneSandbox)}
                      className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                    >
                      {toneSandboxOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <Button type="button" disabled={isPending} onClick={() => generateRewrite(tone)}>
                      {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
                      {t("tone.apply")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <VisualMockupWorkspace
              variant={activeVariant}
              title={t("preview.title")}
              unsupportedLabel={t("preview.unsupported")}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="font-medium text-foreground">{t("empty.title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
          </div>
        )}
      </div>

      {message ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
          <span>{message}</span>
        </div>
      ) : null}
    </section>
  )
}

function replaceOpening(body: string, hook: string) {
  const parts = body.split(/\n\s*\n/)
  const rest = parts.slice(1).join("\n\n").trim()

  if (!rest) {
    return hook
  }

  return `${hook}\n\n${rest}`
}

export function StatusPanel({ post }: { post: Post }) {
  const t = useTranslations("postActions.status")
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
        setMessage({ tone: "error", text: result.error?.message ?? t("errors.updateFailed") })
        return
      }

      setStatus(result.data.post.status)
      setVersion(result.data.post.version)
      setMessage({ tone: "success", text: t("messages.updated") })
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("description", { version })}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("statusGroup")}>
        {workflowStatuses.map((item) => (
          <Button
            key={item}
            type="button"
            variant={item === status ? "default" : "outline"}
            disabled={isPending}
            aria-pressed={item === status}
            onClick={() => updateStatus(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      {message ? (
        <div
          role={message.tone === "success" ? "status" : "alert"}
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
  const t = useTranslations("postActions.metrics")
  const [metrics, setMetrics] = useState(initialMetrics)
  const [message, setMessage] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const [externalId, setExternalId] = useState(post.externalId ?? "")
  const [publishedUrl, setPublishedUrl] = useState(post.publishedUrl ?? "")
  const [isPending, startTransition] = useTransition()
  const [isSyncPending, startSyncTransition] = useTransition()
  
  type SyncErrors = Partial<Record<"externalId" | "publishedUrl", string>>
  const [syncErrors, setSyncErrors] = useState<SyncErrors>({})
  type MetricErrors = Partial<Record<"views" | "likes" | "comments" | "saves" | "followersGained", string>>
  const [metricErrors, setMetricErrors] = useState<MetricErrors>({})

  function syncLiveStats(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setSyncMessage(null)
    
    const errors: SyncErrors = {}
    const parsedExternalId = String(formData.get("externalId") ?? "").trim()
    const parsedPublishedUrl = String(formData.get("publishedUrl") ?? "").trim()
    
    if (!parsedExternalId) {
      errors.externalId = t("sync.errors.externalIdRequired")
    } else if (parsedExternalId.length > 120) {
      errors.externalId = t("sync.errors.externalIdMaxLength")
    }
    
    if (parsedPublishedUrl) {
      try {
        new URL(parsedPublishedUrl)
      } catch {
        errors.publishedUrl = t("sync.errors.invalidUrl")
      }
    }
    
    setSyncErrors(errors)
    if (Object.keys(errors).length > 0) return

    startSyncTransition(async () => {
      const payload = {
        externalId: parsedExternalId,
        publishedUrl: parsedPublishedUrl || undefined,
      }
      const response = await fetch(`/api/v1/posts/${post.id}/sync`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as ApiResult<{
        metric: PostMetric
        post: Post
        externalId: string
        publishedUrl?: string
        mode: string
        source: "youtube"
      }>

      if (!result.ok || !result.data) {
        setSyncMessage({ tone: "error", text: result.error?.message ?? t("sync.errors.failed") })
        return
      }

      setMetrics((current) => [result.data!.metric, ...current])
      setExternalId(result.data.externalId)
      setPublishedUrl(result.data.publishedUrl ?? "")
      setSyncMessage({ tone: "success", text: t("sync.messages.synced", { mode: result.data.mode }) })
    })
  }

  function handleManualMetricsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setMessage(null)
    
    const errors: MetricErrors = {}
    const fields = ["views", "likes", "comments", "saves", "followersGained"] as const
    let hasError = false
    
    for (const field of fields) {
      const val = Number(formData.get(field) ?? 0)
      if (!Number.isInteger(val) || val < 0) {
        errors[field] = t("errors.invalidMetric")
        hasError = true
      }
    }
    
    setMetricErrors(errors)
    if (hasError) return

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
        setMessage(result.error?.message ?? t("errors.saveFailed"))
        return
      }

      setMetrics((current) => [result.data!.metric, ...current])
      setMessage(t("messages.saved", { mode: result.data.mode }))
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
      <form onSubmit={syncLiveStats} className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4" noValidate>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("sync.title")}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("sync.description")}</p>
        </div>
        <div>
          <label htmlFor={`sync-ext-${post.id}`} className="text-sm font-medium text-foreground">
            {t("sync.fields.externalId")}
          </label>
          <input
            id={`sync-ext-${post.id}`}
            name="externalId"
            type="text"
            value={externalId}
            onChange={(event) => {
              setExternalId(event.target.value)
              setSyncErrors((prev) => { const next = { ...prev }; delete next.externalId; return next })
            }}
            placeholder="GpQSUjNsNm0 or S5xNFmAR2xk"
            aria-invalid={!!syncErrors.externalId}
            aria-describedby={syncErrors.externalId ? `sync-ext-${post.id}-error` : undefined}
            className={`mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 ${
              syncErrors.externalId ? "border-destructive" : "border-border"
            }`}
          />
          {syncErrors.externalId ? (
            <p id={`sync-ext-${post.id}-error`} className="mt-1 text-xs text-destructive" role="alert">{syncErrors.externalId}</p>
          ) : null}
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-100 p-3 dark:border-amber-400/40 dark:bg-amber-400/15">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
              {t("sync.examplesLabel")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["GpQSUjNsNm0", "S5xNFmAR2xk"].map((exampleId) => (
                <button
                  key={exampleId}
                  type="button"
                  onClick={() => {
                    setExternalId(exampleId)
                    setSyncErrors((prev) => { const next = { ...prev }; delete next.externalId; return next })
                  }}
                  className="rounded-lg border border-amber-500 bg-amber-400 px-3 py-2 font-mono text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300 focus:outline-none focus:ring-3 focus:ring-amber-500/40"
                >
                  {exampleId}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label htmlFor={`sync-url-${post.id}`} className="text-sm font-medium text-foreground">
            {t("sync.fields.publishedUrl")}
          </label>
          <input
            id={`sync-url-${post.id}`}
            name="publishedUrl"
            type="url"
            value={publishedUrl}
            onChange={(event) => {
              setPublishedUrl(event.target.value)
              setSyncErrors((prev) => { const next = { ...prev }; delete next.publishedUrl; return next })
            }}
            placeholder="https://www.youtube.com/watch?v=GpQSUjNsNm0"
            aria-invalid={!!syncErrors.publishedUrl}
            aria-describedby={syncErrors.publishedUrl ? `sync-url-${post.id}-error` : undefined}
            className={`mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 ${
              syncErrors.publishedUrl ? "border-destructive" : "border-border"
            }`}
          />
          {syncErrors.publishedUrl ? (
            <p id={`sync-url-${post.id}-error`} className="mt-1 text-xs text-destructive" role="alert">{syncErrors.publishedUrl}</p>
          ) : null}
        </div>
        <Button type="submit" variant="outline" disabled={isSyncPending}>
          {isSyncPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
          {t("sync.button")}
        </Button>
      </form>
      {syncMessage ? (
        <div
          role={syncMessage.tone === "success" ? "status" : "alert"}
          className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-sm ${
            syncMessage.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {syncMessage.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
          <span>{syncMessage.text}</span>
        </div>
      ) : null}
      <form onSubmit={handleManualMetricsSubmit} className="mt-4 grid gap-3" noValidate>
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">{t("manualTitle")}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="views" label={t("fields.views")} defaultValue={5200} error={metricErrors.views} onChange={() => setMetricErrors((p) => ({ ...p, views: undefined }))} />
          <NumberField name="likes" label={t("fields.likes")} defaultValue={260} error={metricErrors.likes} onChange={() => setMetricErrors((p) => ({ ...p, likes: undefined }))} />
          <NumberField name="comments" label={t("fields.comments")} defaultValue={32} error={metricErrors.comments} onChange={() => setMetricErrors((p) => ({ ...p, comments: undefined }))} />
          <NumberField name="saves" label={t("fields.saves")} defaultValue={61} error={metricErrors.saves} onChange={() => setMetricErrors((p) => ({ ...p, saves: undefined }))} />
          <NumberField name="followersGained" label={t("fields.followersGained")} defaultValue={11} error={metricErrors.followersGained} onChange={() => setMetricErrors((p) => ({ ...p, followersGained: undefined }))} />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          {t("save")}
        </Button>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
      <div className="mt-4 grid gap-2">
        {metrics.length ? (
          metrics.slice(0, 3).map((metric) => (
            <div key={`${metric.postId}-${metric.publishedAt}`} className="rounded-lg border border-border bg-background p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{t("metricSummary.views", { views: metric.views.toLocaleString() })}</span>
                {metric.source === "youtube" ? (
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{t("liveSynced")}</span>
                ) : null}
              </div>
              <span className="text-muted-foreground"> · {t("metricSummary.likes", { likes: metric.likes })} · {t("metricSummary.saves", { saves: metric.saves })}</span>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            {t("empty")}
          </div>
        )}
      </div>
    </section>
  )
}

export function DraftPanel({ post }: { post: Post }) {
  const t = useTranslations("postActions.draft")
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
        setMessage(result.error?.message ?? t("errors.generateFailed"))
        return
      }

      setDraft(result.data.generation.data.body)
      setMessage(result.data.generation.warning ?? t("messages.generated", { version: result.data.generation.data.version }))
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
        <Button type="button" variant="outline" disabled={isPending} onClick={generateDraft}>
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <PenLine data-icon="inline-start" />}
          {t("generate")}
        </Button>
      </div>
      <p className="mt-4 whitespace-pre-line rounded-xl border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
        {draft}
      </p>
      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
    </section>
  )
}

function NumberField({ 
  name, 
  label, 
  defaultValue, 
  error, 
  onChange 
}: { 
  name: string; 
  label: string; 
  defaultValue: number; 
  error?: string; 
  onChange?: () => void;
}) {
  return (
    <div>
      <label htmlFor={`metric-${name}`} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={`metric-${name}`}
        name={name}
        type="number"
        min="0"
        defaultValue={defaultValue}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `metric-${name}-error` : undefined}
        className={`mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error ? (
        <p id={`metric-${name}-error`} className="mt-1 text-xs text-destructive" role="alert">{error}</p>
      ) : null}
    </div>
  )
}
