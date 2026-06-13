import { fail, ok, validationError } from "@/lib/api/response"
import { queuePostSchema } from "@/lib/domain"
import { addPostToQueue } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = queuePostSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Queue payload is invalid.")
  }

  const result = await addPostToQueue(workspace.workspaceId, id, parsed.data)

  if (!result.ok) {
    return fail(result.code, result.message, { status: result.code === "NOT_FOUND" ? 404 : 409 })
  }

  return ok({ ...result, workspace })
}
