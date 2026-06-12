import { ok, validationError } from "@/lib/api/response"
import { metricImportBatchSchema, metricInputSchema } from "@/lib/domain"
import { saveMetric } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const batch = metricImportBatchSchema.safeParse(body)

  if (batch.success) {
    const metrics = batch.data.metrics.map((metric) => ({
      ...metric,
      publishedAt: metric.publishedAt ?? new Date().toISOString(),
    }))
    const saved = await Promise.all(metrics.map((metric) => saveMetric(workspace.workspaceId, metric)))

    return ok({
      metrics: saved.map((item) => item.metric),
      count: saved.length,
      mode: saved[0]?.mode ?? "demo",
      workspace,
    })
  }

  const parsed = metricInputSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Metric payload is missing required fields.")
  }

  const metric = {
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ?? new Date().toISOString(),
  }
  const result = await saveMetric(workspace.workspaceId, metric)

  return ok({ ...result, workspace })
}
