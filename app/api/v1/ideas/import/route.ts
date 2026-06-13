import { ok, validationError } from "@/lib/api/response"
import { requireAdmin } from "@/lib/admin-auth"
import { ideaImportSchema } from "@/lib/domain"
import { createIdea } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin.ok) {
    return admin.response
  }

  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const parsed = ideaImportSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Idea import payload is invalid.")
  }

  const saved = await Promise.all(
    parsed.data.ideas.map((idea) => createIdea(workspace.workspaceId, idea, "approved-trend")),
  )

  return ok({
    ideas: saved.map((item) => item.idea),
    count: saved.length,
    mode: saved[0]?.mode ?? "demo",
    workspace,
  })
}
