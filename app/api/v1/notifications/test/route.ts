import { ok, validationError } from "@/lib/api/response"
import { requireAdmin } from "@/lib/admin-auth"
import { notificationTestSchema } from "@/lib/domain"
import { sendPlanReadySmokeEmail } from "@/lib/services/notification-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return admin.response
  }

  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => ({}))
  const parsed = notificationTestSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Notification test payload is invalid.")
  }

  const result = await sendPlanReadySmokeEmail({
    workspaceId: workspace.workspaceId,
    to: parsed.data.email,
  })

  return ok({ ...result, workspace })
}
