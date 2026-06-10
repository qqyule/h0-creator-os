import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { getPublicAiSettings, saveAiSettings, toAiSettingsError } from "@/lib/ai-settings"

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return admin.response
  }

  try {
    return NextResponse.json({ ok: true, data: await getPublicAiSettings() })
  } catch (error) {
    const safeError = toAiSettingsError(error)
    return NextResponse.json(
      { ok: false, error: { code: safeError.code, message: safeError.message } },
      { status: safeError.status },
    )
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return admin.response
  }

  try {
    const body = await request.json()
    const data = await saveAiSettings({
      baseUrl: String(body.baseUrl || ""),
      model: String(body.model || ""),
      enabled: Boolean(body.enabled),
      apiKey: typeof body.apiKey === "string" ? body.apiKey : undefined,
    })

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    const safeError = toAiSettingsError(error)
    return NextResponse.json(
      { ok: false, error: { code: safeError.code, message: safeError.message } },
      { status: safeError.status },
    )
  }
}
