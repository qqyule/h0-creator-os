import { ok, validationError } from "@/lib/api/response"
import { metricInputSchema } from "@/lib/domain"
import { saveMetric } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
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
