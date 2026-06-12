import { fail, ok, validationError } from "@/lib/api/response"
import { taskStatusUpdateSchema } from "@/lib/domain"
import { updateTaskStatus } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = taskStatusUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("A valid task status is required.")
  }

  const result = await updateTaskStatus(workspace.workspaceId, id, parsed.data.status)

  if (!result.ok) {
    return fail(result.code, result.message, { status: 404 })
  }

  return ok({ ...result, workspace })
}
