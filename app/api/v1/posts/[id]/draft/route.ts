import { fail, ok, validationError } from "@/lib/api/response"
import { draftRequestSchema } from "@/lib/domain"
import { ContentNotFoundError, getPostDetail, saveDraft } from "@/lib/repositories/content-repository"
import { generateDraft } from "@/lib/services/ai-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = draftRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Platform is required for draft generation.")
  }

  let detail
  try {
    detail = await getPostDetail(workspace.workspaceId, id)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
  const generation = await generateDraft(detail, parsed.data.platform)
  const saved = await saveDraft(workspace.workspaceId, generation.data)

  return ok({ generation, saved, workspace })
}
