"use client"

import { AlertCircle, CheckCircle2, EyeOff, Loader2, PlugZap, Save } from "lucide-react"
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

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  if (payload) {
    return payload
  }

  return {
    ok: false,
    error: {
      code: "provider_error",
      message: "Unexpected response from server.",
    },
  }
}

export function AiSettingsForm() {
  const [settings, setSettings] = useState<PublicAiSettings>(emptySettings)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null)

  const keySummary = useMemo(() => {
    if (apiKey.trim()) {
      return "New key will replace the saved key when you save."
    }
    if (settings.hasApiKey) {
      return `Configured: ${settings.apiKeyHint || "masked"}`
    }
    return "No API key saved."
  }, [apiKey, settings.apiKeyHint, settings.hasApiKey])

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setLoading(true)
      const response = await fetch("/api/v1/settings/ai", { cache: "no-store" })
      const payload = await readJson<PublicAiSettings>(response)

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
  }, [])

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
    const payload = await readJson<PublicAiSettings>(response)

    if (payload.ok) {
      setSettings(payload.data)
      setApiKey("")
      setMessage({ tone: "success", text: "AI provider settings saved." })
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
    const payload = await readJson<{ model: string; sample?: string }>(response)

    if (payload.ok) {
      setMessage({ tone: "success", text: `Connection verified with ${payload.data.model}.` })
    } else {
      setMessage({ tone: "error", text: payload.error.message })
    }

    setTesting(false)
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">OpenAI-compatible provider</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Configure a provider once for the global admin workspace. Leave the API key field blank to keep the saved key.
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            settings.enabled
              ? "bg-emerald-500/12 text-emerald-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {settings.enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {settings.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="mt-5 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Base URL</span>
          <input
            value={settings.baseUrl}
            onChange={(event) => setSettings((current) => ({ ...current, baseUrl: event.target.value }))}
            placeholder="https://api.openai.com/v1"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            disabled={loading || saving}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Model</span>
          <input
            value={settings.model}
            onChange={(event) => setSettings((current) => ({ ...current, model: event.target.value }))}
            placeholder="gpt-4o-mini"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            disabled={loading || saving}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">API Key</span>
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={settings.hasApiKey ? "Leave blank to keep saved key" : "sk-..."}
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
            <span className="block text-sm font-medium text-foreground">Enable AI provider</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              When disabled, future generation flows should use demo or mock fallback instead of blocking the MVP path.
            </span>
          </span>
        </label>

        {message ? (
          <div
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
            Test connection
          </button>

          <button
            type="button"
            onClick={saveSettings}
            disabled={loading || saving || testing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save settings
          </button>
        </div>
      </div>
    </section>
  )
}
