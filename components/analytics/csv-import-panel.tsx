"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { AlertCircle, Download, FileUp, Loader2, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { z } from "zod"
import { PlatformPill } from "@/components/app/platform-pill"
import { Button } from "@/components/ui/button"
import { toastApiError, toastInfo, toastSuccess } from "@/lib/client/api-toast"
import { metricInputSchema, type Post, type PostMetric } from "@/lib/domain"

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

type ParsedRow = {
  line: number
  raw: Record<string, string>
  metric?: z.infer<typeof metricInputSchema>
  error?: string
}

type Delta = {
  views: number
  likes: number
  comments: number
  saves: number
  followersGained: number
}

type BackupResult = {
  ok: boolean
  message: string
}

const csvHeaders = ["postId", "platform", "publishedAt", "views", "likes", "comments", "saves", "followersGained"]

export function CsvImportPanel({ posts, metrics }: { posts: Post[]; metrics: PostMetric[] }) {
  const t = useTranslations("analytics.csv")
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [isPending, startTransition] = useTransition()
  const validRows = rows.filter((row) => row.metric)
  const invalidRows = rows.filter((row) => row.error)
  const currentByPostPlatform = useMemo(() => aggregateMetrics(metrics), [metrics])

  function reset() {
    setFile(null)
    setRows([])
    if (fileRef.current) {
      fileRef.current.value = ""
    }
  }

  async function handleFileChange(nextFile: File | undefined) {
    if (!nextFile) {
      reset()
      return
    }

    if (!nextFile.name.toLowerCase().endsWith(".csv")) {
      toastApiError(null, t("errors.fileType"))
      reset()
      return
    }

    const text = await nextFile.text()
    setFile(nextFile)
    setRows(parseCsv(text))
  }

  function commitImport() {
    if (!file || !validRows.length || invalidRows.length) {
      toastApiError(null, t("errors.invalidRows"))
      return
    }

    startTransition(async () => {
      const backup = await backupRawCsv(file)
      if (backup.ok) {
        toastInfo(backup.message)
      } else {
        toastApiError(null, backup.message)
      }

      const response = await fetch("/api/v1/metrics/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ metrics: validRows.map((row) => row.metric) }),
      })
      const result = (await response.json()) as ApiResult<{ count: number }>

      if (!result.ok || !result.data) {
        toastApiError(result, t("errors.importFailed"))
        return
      }

      toastSuccess(t("messages.imported", { count: result.data.count }))
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{t("description")}</p>
        </div>
        <Button asChild variant="outline">
          <a href="/templates/creatoros-metrics-template.csv" download>
            <Download data-icon="inline-start" />
            {t("downloadTemplate")}
          </a>
        </Button>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg px-4 py-8 text-center hover:bg-accent/40">
          <FileUp className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-foreground">{file?.name ?? t("chooseFile")}</span>
          <span className="text-xs text-muted-foreground">{t("columns")}</span>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
        </label>
      </div>

      {rows.length ? (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label={t("fileName")} value={file?.name ?? "-"} />
            <SummaryCard label={t("validRows")} value={validRows.length.toString()} />
            <SummaryCard label={t("invalidRows")} value={invalidRows.length.toString()} />
          </div>

          {invalidRows.length ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                {t("errors.fixRows")}
              </div>
              <ul className="mt-3 grid gap-1 text-muted-foreground">
                {invalidRows.slice(0, 5).map((row) => (
                  <li key={row.line}>{t("lineError", { line: row.line, error: row.error ?? t("errors.unknown") })}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {validRows.length ? (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-[820px] w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{t("table.post")}</th>
                    <th className="px-3 py-2">{t("table.platform")}</th>
                    <th className="px-3 py-2">{t("table.publishedAt")}</th>
                    <th className="px-3 py-2">{t("table.viewsDelta")}</th>
                    <th className="px-3 py-2">{t("table.likesDelta")}</th>
                    <th className="px-3 py-2">{t("table.savesDelta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.slice(0, 8).map((row) => {
                    const metric = row.metric!
                    const post = posts.find((item) => item.id === metric.postId)
                    const current = currentByPostPlatform.get(metricKey(metric)) ?? emptyDelta()
                    return (
                      <tr key={`${row.line}-${metric.postId}-${metric.platform}`} className="border-t border-border">
                        <td className="px-3 py-3">
                          <p className="max-w-[260px] truncate font-medium text-foreground">{post?.title ?? metric.postId}</p>
                          <p className="text-xs text-muted-foreground">{metric.postId}</p>
                        </td>
                        <td className="px-3 py-3">
                          <PlatformPill platform={metric.platform} />
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{metric.publishedAt?.slice(0, 10)}</td>
                        <td className="px-3 py-3">{formatDelta(metric.views - current.views)}</td>
                        <td className="px-3 py-3">{formatDelta(metric.likes - current.likes)}</td>
                        <td className="px-3 py-3">{formatDelta(metric.saves - current.saves)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={reset} disabled={isPending}>{t("reset")}</Button>
              <Button onClick={commitImport} disabled={isPending || !validRows.length || Boolean(invalidRows.length)}>
                {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
                {t("commit")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )

  async function backupRawCsv(rawFile: File): Promise<BackupResult> {
    const presignResponse = await fetch("/api/v1/assets/presign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: rawFile.name,
        contentType: rawFile.type || "text/csv",
        purpose: "metrics-import",
      }),
    })
    const presign = (await presignResponse.json()) as ApiResult<{
      configured: boolean
      key: string
      uploadUrl: string | null
      warning?: string
    }>

    if (!presign.ok || !presign.data) {
      return { ok: false, message: presign.error?.message ?? t("errors.backupFailed") }
    }

    if (!presign.data.configured || !presign.data.uploadUrl) {
      return { ok: true, message: presign.data.warning ?? t("messages.s3Unconfigured") }
    }

    const upload = await fetch(presign.data.uploadUrl, {
      method: "PUT",
      headers: { "content-type": rawFile.type || "text/csv" },
      body: rawFile,
    })

    if (!upload.ok) {
      return { ok: false, message: t("errors.backupFailed") }
    }

    return { ok: true, message: t("messages.backedUp", { key: presign.data.key }) }
  }
}

function parseCsv(text: string): ParsedRow[] {
  const records = parseCsvRecords(text).filter((row) => row.some((cell) => cell.trim()))
  const [headerRow, ...dataRows] = records

  if (!headerRow) {
    return [{ line: 1, raw: {}, error: "CSV is empty." }]
  }

  const headers = headerRow.map((header) => header.trim())
  const missing = csvHeaders.filter((header) => !headers.includes(header))

  if (missing.length) {
    return [{ line: 1, raw: {}, error: `Missing columns: ${missing.join(", ")}` }]
  }

  return dataRows.map((cells, index) => {
    const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]?.trim() ?? ""]))
    const metric = metricInputSchema.safeParse({
      postId: raw.postId,
      platform: raw.platform,
      publishedAt: raw.publishedAt,
      views: toNumber(raw.views),
      likes: toNumber(raw.likes),
      comments: toNumber(raw.comments),
      saves: toNumber(raw.saves),
      followersGained: toNumber(raw.followersGained),
      source: "manual",
    })

    if (!metric.success) {
      return {
        line: index + 2,
        raw,
        error: metric.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
      }
    }

    return {
      line: index + 2,
      raw,
      metric: metric.data,
    }
  })
}

function parseCsvRecords(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === "," && !quoted) {
      row.push(cell)
      cell = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1
      }
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      continue
    }

    cell += char
  }

  row.push(cell)
  rows.push(row)
  return rows
}

function toNumber(value: string) {
  const number = Number(value)
  return Number.isFinite(number) ? number : NaN
}

function metricKey(metric: Pick<PostMetric, "postId" | "platform">) {
  return `${metric.postId}#${metric.platform}`
}

function aggregateMetrics(metrics: PostMetric[]) {
  const result = new Map<string, Delta>()

  for (const metric of metrics) {
    const current = result.get(metricKey(metric)) ?? emptyDelta()
    result.set(metricKey(metric), {
      views: current.views + metric.views,
      likes: current.likes + metric.likes,
      comments: current.comments + metric.comments,
      saves: current.saves + metric.saves,
      followersGained: current.followersGained + metric.followersGained,
    })
  }

  return result
}

function emptyDelta(): Delta {
  return { views: 0, likes: 0, comments: 0, saves: 0, followersGained: 0 }
}

function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString()}`
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
