import { fail, ok, validationError } from "@/lib/api/response"
import { DEMO_MONTH } from "@/lib/demo-data"
import { actionableTaskRequestSchema } from "@/lib/domain"
import {
  ContentNotFoundError,
  getMonthlyPlan,
  listInsights,
  listMetrics,
  saveTasks,
} from "@/lib/repositories/content-repository"
import { generateActionableTasks } from "@/lib/services/ai-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => ({}))
  const parsed = actionableTaskRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Actionable task payload is invalid.")
  }

  const month = parsed.data.month ?? DEMO_MONTH

  try {
    const [plan, insights, metrics] = await Promise.all([
      getMonthlyPlan(workspace.workspaceId, month),
      listInsights(workspace.workspaceId, month),
      listMetrics(workspace.workspaceId, month),
    ])
    const generation = await generateActionableTasks(workspace.workspaceId, month, plan, insights, metrics)
    const saved = await saveTasks(workspace.workspaceId, generation.data)

    return ok({ generation, saved, workspace })
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
}
