import { ok } from "@/lib/api/response"
import { DEMO_MONTH } from "@/lib/demo-data"
import { calculateBestTimes } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET(request: Request) {
  const workspace = await resolveWorkspace()
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") ?? DEMO_MONTH
  const result = await calculateBestTimes(workspace.workspaceId, month)

  return ok({ ...result, workspace })
}
