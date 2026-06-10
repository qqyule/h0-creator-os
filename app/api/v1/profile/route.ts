import { accountDnaInputSchema } from "@/lib/domain"
import { fail, ok, validationError } from "@/lib/api/response"
import { ContentNotFoundError, getProfile, saveProfile } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET() {
  const workspace = await resolveWorkspace()
  try {
    const profile = await getProfile(workspace.workspaceId)

    return ok({ profile, workspace })
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
}

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const parsed = accountDnaInputSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Account DNA is missing required fields.")
  }

  const result = await saveProfile(workspace.workspaceId, parsed.data)

  if (workspace.mode === "demo" && result.mode === "demo") {
    return ok({
      ...result,
      workspace,
      warning: "Saved in demo fallback mode because external persistence is not configured.",
    })
  }

  if (!result.profile) {
    return fail("PROFILE_SAVE_FAILED", "Profile could not be saved.")
  }

  return ok({ ...result, workspace })
}
