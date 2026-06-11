import { fail, ok, validationError } from "@/lib/api/response"
import { hookRewriteRequestSchema } from "@/lib/domain"
import { ContentNotFoundError, getPostDetail } from "@/lib/repositories/content-repository"
import { generateHookOptions } from "@/lib/services/ai-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = hookRewriteRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Platform is required for hook generation.")
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

  const generation = await generateHookOptions(detail, parsed.data.platform, parsed.data.body)

  return ok({ hooks: generation.data, source: generation.source, warning: generation.warning })
}
