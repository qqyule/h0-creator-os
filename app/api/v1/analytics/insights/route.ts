import { fail, ok } from "@/lib/api/response"
import { DEMO_MONTH } from "@/lib/demo-data"
import type { MonthlyPlan, PostMetric } from "@/lib/domain"
import {
  ContentNotFoundError,
  getMonthlyPlan,
  listInsights,
  listMetrics,
  saveInsight,
} from "@/lib/repositories/content-repository"
import { generateInsight } from "@/lib/services/ai-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET(request: Request) {
  const workspace = await resolveWorkspace()
  const url = new URL(request.url)
  const month = url.searchParams.get("month") ?? DEMO_MONTH
  const insights = await listInsights(workspace.workspaceId, month)

  return ok({ insights, workspace })
}

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = (await request.json().catch(() => ({}))) as { month?: string }
  const month = body.month ?? DEMO_MONTH
  let plan: MonthlyPlan
  let metrics: PostMetric[]
  try {
    ;[plan, metrics] = await Promise.all([
      getMonthlyPlan(workspace.workspaceId, month),
      listMetrics(workspace.workspaceId, month),
    ])
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
  const generation = await generateInsight(workspace.workspaceId, month, plan, metrics)
  const saved = await saveInsight(workspace.workspaceId, generation.data)

  return ok({ generation, saved, workspace })
}
