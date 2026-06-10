import { fail, ok, validationError } from "@/lib/api/response"
import { statusUpdateSchema } from "@/lib/domain"
import { updatePostStatus } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = statusUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("A valid workflow status is required.")
  }

  const result = await updatePostStatus(workspace.workspaceId, id, parsed.data.status, parsed.data.version)

  if (!result.ok) {
    return fail(result.code, result.message, { status: result.code === "NOT_FOUND" ? 404 : 409 })
  }

  return ok({ ...result, workspace })
}
