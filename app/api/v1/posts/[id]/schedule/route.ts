import { fail, ok, validationError } from "@/lib/api/response"
import { scheduleUpdateSchema } from "@/lib/domain"
import { updatePostSchedule } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = scheduleUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Schedule payload is invalid.")
  }

  const result = await updatePostSchedule(workspace.workspaceId, id, parsed.data)

  if (!result.ok) {
    return fail(result.code, result.message, { status: result.code === "NOT_FOUND" ? 404 : 409 })
  }

  return ok({ ...result, workspace })
}
