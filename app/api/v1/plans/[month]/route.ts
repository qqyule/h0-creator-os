import { fail, ok } from "@/lib/api/response"
import { ContentNotFoundError, getMonthlyPlan } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET(_request: Request, { params }: { params: Promise<{ month: string }> }) {
  const workspace = await resolveWorkspace()
  const { month } = await params
  try {
    const plan = await getMonthlyPlan(workspace.workspaceId, month)

    return ok({ plan, workspace })
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
}
