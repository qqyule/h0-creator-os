import { ok, validationError } from "@/lib/api/response"
import { brandVoiceInputSchema } from "@/lib/domain"
import { getBrandVoice, saveBrandVoice } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export async function GET() {
  const workspace = await resolveWorkspace()
  const brandVoice = await getBrandVoice(workspace.workspaceId)

  return ok({ brandVoice: brandVoice ?? null, workspace })
}

export async function PATCH(request: Request) {
  const workspace = await resolveWorkspace()
  const body = await request.json().catch(() => undefined)
  const parsed = brandVoiceInputSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("Brand voice payload is invalid.")
  }

  const normalized = {
    traits: parsed.data.traits,
    examples: parsed.data.examples.map((example, index) => ({
      ...example,
      id: example.id ?? `example-${index + 1}`,
    })),
  }
  const result = await saveBrandVoice(workspace.workspaceId, normalized)

  return ok({ ...result, workspace })
}
