import { fail, ok, validationError } from "@/lib/api/response"
import { ideaInputSchema, ideaUpdateSchema } from "@/lib/domain"
import { createIdea, listIdeas, updateIdea } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET() {
  const workspace = await resolveWorkspace()
  const ideas = await listIdeas(workspace.workspaceId)

  return ok({ ideas, workspace })
}

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const parsed = ideaInputSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Idea payload is invalid.")
  }

  const result = await createIdea(workspace.workspaceId, parsed.data)

  return ok({ ...result, workspace })
}

export async function PATCH(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const parsed = ideaUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Idea update payload is invalid.")
  }

  const result = await updateIdea(workspace.workspaceId, parsed.data)

  if (!result.ok) {
    return fail(result.code, result.message, { status: 404 })
  }

  return ok({ ...result, workspace })
}
