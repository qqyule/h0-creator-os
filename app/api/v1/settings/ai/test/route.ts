import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { toAiSettingsError } from "@/lib/ai-settings"
import { testAiProvider } from "@/lib/ai-provider"

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return admin.response
  }

  try {
    const body = await request.json().catch(() => ({}))
    const result = await testAiProvider({
      baseUrl: typeof body.baseUrl === "string" ? body.baseUrl : undefined,
      model: typeof body.model === "string" ? body.model : undefined,
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      apiKey: typeof body.apiKey === "string" ? body.apiKey : undefined,
    })

    return NextResponse.json({ ok: true, data: result })
  } catch (error) {
    const safeError = toAiSettingsError(error)
    return NextResponse.json(
      { ok: false, error: { code: safeError.code, message: safeError.message } },
      { status: safeError.status },
    )
  }
}
