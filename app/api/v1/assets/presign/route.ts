import { ok, validationError } from "@/lib/api/response"
import { requireAdmin } from "@/lib/admin-auth"
import { assetPresignSchema } from "@/lib/domain"
import { createPresignedUpload } from "@/lib/services/storage-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const parsed = assetPresignSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Asset presign payload is invalid.")
  }

  if (parsed.data.purpose !== "metrics-import") {
    const admin = await requireAdmin()
    if (!admin.ok) {
      return admin.response
    }
  }

  const result = await createPresignedUpload({
    workspaceId: workspace.workspaceId,
    ...parsed.data,
  })

  return ok({ ...result, workspace })
}
