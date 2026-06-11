"use client"

import { AlertCircle, CheckCircle2, EyeOff, Loader2, PlugZap, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

type PublicAiSettings = {
  baseUrl: string
  model: string
  enabled: boolean
  hasApiKey: boolean
  apiKeyHint?: string
  updatedAt?: string
}

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }

const emptySettings: PublicAiSettings = {
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  enabled: false,
  hasApiKey: false,
}

async function readJson<T>(response: Response, fallbackMessage: string): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  if (payload) {
    return payload
  }

  return {
    ok: false,
    error: {
      code: "provider_error",
      message: fallbackMessage,
    },
  }
}

export function AiSettingsForm() {
  const t = useTranslations("aiSettings")
  const [settings, setSettings] = useState<PublicAiSettings>(emptySettings)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null)

  const keySummary = useMemo(() => {
    if (apiKey.trim()) {
      return t("keySummary.newKey")
    }
    if (settings.hasApiKey) {
      return t("keySummary.configured", { hint: settings.apiKeyHint || t("keySummary.masked") })
    }
    return t("keySummary.empty")
  }, [apiKey, settings.apiKeyHint, settings.hasApiKey, t])

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setLoading(true)
      const response = await fetch("/api/v1/settings/ai", { cache: "no-store" })
      const payload = await readJson<PublicAiSettings>(response, t("errors.unexpectedResponse"))

      if (!active) {
        return
      }

      if (payload.ok) {
        setSettings(payload.data)
        setMessage(null)
      } else {
        setMessage({ tone: "error", text: payload.error.message })
      }
      setLoading(false)
    }

    loadSettings()

    return () => {
      active = false
    }
  }, [t])

  async function saveSettings() {
    setSaving(true)
    setMessage(null)

    const response = await fetch("/api/v1/settings/ai", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl: settings.baseUrl,
        model: settings.model,
        enabled: settings.enabled,
        apiKey: apiKey.trim() || undefined,
      }),
    })
    const payload = await readJson<PublicAiSettings>(response, t("errors.unexpectedResponse"))

    if (payload.ok) {
      setSettings(payload.data)
      setApiKey("")
      setMessage({ tone: "success", text: t("messages.saved") })
    } else {
      setMessage({ tone: "error", text: payload.error.message })
    }

    setSaving(false)
  }

  async function testConnection() {
    setTesting(true)
    setMessage(null)

    const response = await fetch("/api/v1/settings/ai/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl: settings.baseUrl,
        model: settings.model,
        enabled: settings.enabled,
        apiKey: apiKey.trim() || undefined,
      }),
    })
    const payload = await readJson<{ model: string; sample?: string }>(response, t("errors.unexpectedResponse"))

    if (payload.ok) {
      setMessage({ tone: "success", text: t("messages.verified", { model: payload.data.model }) })
    } else {
      setMessage({ tone: "error", text: payload.error.message })
    }

    setTesting(false)
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("description")}</p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            settings.enabled
              ? "bg-emerald-500/12 text-emerald-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {settings.enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {settings.enabled ? t("enabled") : t("disabled")}
        </span>
      </div>

      <div className="mt-5 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">{t("fields.baseUrl")}</span>
          <input
            value={settings.baseUrl}
            onChange={(event) => setSettings((current) => ({ ...current, baseUrl: event.target.value }))}
            placeholder="https://api.openai.com/v1"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            disabled={loading || saving}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">{t("fields.model")}</span>
          <input
            value={settings.model}
            onChange={(event) => setSettings((current) => ({ ...current, model: event.target.value }))}
            placeholder="gpt-4o-mini"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            disabled={loading || saving}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">{t("fields.apiKey")}</span>
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={settings.hasApiKey ? t("placeholders.keepKey") : "sk-..."}
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            disabled={loading || saving}
          />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" />
            {keySummary}
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/35 p-3">
          <input
            checked={settings.enabled}
            onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
            disabled={loading || saving}
          />
          <span>
            <span className="block text-sm font-medium text-foreground">{t("enableLabel")}</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">{t("enableDescription")}</span>
          </span>
        </label>

        {message ? (
          <div
            role={message.tone === "error" ? "alert" : "status"}
            className={`rounded-xl border px-3 py-2 text-sm ${
              message.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : message.tone === "error"
                  ? "border-destructive/35 bg-destructive/10 text-destructive"
                  : "border-border bg-muted/45 text-muted-foreground"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={testConnection}
            disabled={loading || testing || saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
            {t("testConnection")}
          </button>

          <button
            type="button"
            onClick={saveSettings}
            disabled={loading || saving || testing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("saveSettings")}
          </button>
        </div>
      </div>
    </section>
  )
}
