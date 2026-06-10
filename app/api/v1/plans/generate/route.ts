import { fail, ok } from "@/lib/api/response"
import { DEMO_MONTH } from "@/lib/demo-data"
import type { AccountDna } from "@/lib/domain"
import { generateMonthlyPlan } from "@/lib/services/ai-service"
import { ContentNotFoundError, getProfile } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = (await request.json().catch(() => ({}))) as { month?: string }
  const month = body.month ?? DEMO_MONTH
  let profile: AccountDna
  try {
    profile = await getProfile(workspace.workspaceId)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
  const result = await generateMonthlyPlan(profile, month)

  return ok({ ...result, workspace })
}
