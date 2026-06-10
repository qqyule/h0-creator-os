import "server-only"

import { auth } from "@clerk/nextjs/server"
import { fail } from "@/lib/api/response"
import { getOptionalEnv } from "@/lib/env"

function adminUserIds() {
  return (getOptionalEnv("CREATOROS_ADMIN_CLERK_USER_IDS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
}

export async function requireAdmin() {
  try {
    const { userId } = await auth()
    const allowed = adminUserIds()

    if (userId && allowed.includes(userId)) {
      return { ok: true as const, userId }
    }
  } catch {
    // Missing Clerk configuration or session should not grant admin access.
  }

  return {
    ok: false as const,
    response: fail("FORBIDDEN", "Admin access is required for this operation.", { status: 403 }),
  }
}
