import { fail, ok } from "@/lib/api/response"
import { ContentNotFoundError, getPostDetail } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  try {
    const detail = await getPostDetail(workspace.workspaceId, id)

    return ok({ detail, workspace })
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }
}
