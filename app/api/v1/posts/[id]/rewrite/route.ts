import { fail, ok, validationError } from "@/lib/api/response"
import { rewriteRequestSchema } from "@/lib/domain"
import { ContentNotFoundError, getBrandVoice, getPostDetail, saveVariant } from "@/lib/repositories/content-repository"
import { generatePlatformRewrite } from "@/lib/services/ai-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = rewriteRequestSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Platform is required for rewrite generation.")
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

  if (detail.post.id !== id) {
    return fail("POST_NOT_FOUND", "Post could not be found.", { status: 404 })
  }

  const brandVoice = await getBrandVoice(workspace.workspaceId)
  const generation = await generatePlatformRewrite(detail, parsed.data.platform, parsed.data.tone, brandVoice)
  const saved = await saveVariant(workspace.workspaceId, id, generation.data)

  return ok({ generation, saved, workspace })
}
