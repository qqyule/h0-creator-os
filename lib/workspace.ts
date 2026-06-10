import { auth } from "@clerk/nextjs/server"
import { DEMO_WORKSPACE_ID } from "@/lib/demo-data"

export type WorkspaceContext = {
  workspaceId: string
  mode: "demo" | "authenticated"
  clerkUserId?: string
}

export async function resolveWorkspace(): Promise<WorkspaceContext> {
  try {
    const session = await auth()
    const userId = session.userId

    if (userId) {
      return {
        workspaceId: `USER#${userId}`,
        mode: "authenticated",
        clerkUserId: userId,
      }
    }
  } catch {
    // Clerk is intentionally optional for the judge demo path until resources are provided.
  }

  return {
    workspaceId: DEMO_WORKSPACE_ID,
    mode: "demo",
  }
}
