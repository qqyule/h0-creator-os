"use client"

import { AlertCircle, CheckCircle2, EyeOff, Loader2, PlugZap, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { readApiJson, toastApiError, toastSuccess } from "@/lib/client/api-toast"

type PublicAiSettings = {
  baseUrl: string
  model: string
  enabled: boolean
  hasApiKey: boolean
  apiKeyHint?: string
  updatedAt?: string
}

const emptySettings: PublicAiSettings = {
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  enabled: false,
  hasApiKey: false,
}

type FieldErrors = Partial<Record<"baseUrl" | "model", string>>

export function AiSettingsForm() {
  const t = useTranslations("aiSettings")
  const [settings, setSettings] = useState<PublicAiSettings>(emptySettings)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

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
      const payload = await readApiJson<PublicAiSettings>(response, t("errors.unexpectedResponse"))

      if (!active) {
        return
      }

      if (payload.ok) {
        setSettings(payload.data)
      } else {
        toastApiError(payload, t("errors.unexpectedResponse"))
      }
      setLoading(false)
    }

    loadSettings()

    return () => {
      active = false
    }
  }, [t])

  /** 清除单个字段的错误（在用户输入时调用） */
  const handleClearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  /** 校验 baseUrl 和 model，返回是否通过 */
  const validateSettings = (): boolean => {
    const errors: FieldErrors = {}

    const baseUrl = settings.baseUrl.trim().replace(/\/+$/, "")
    if (!baseUrl) {
      errors.baseUrl = t("errors.baseUrlRequired")
    } else {
      try {
        const url = new URL(baseUrl)
        if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
          errors.baseUrl = t("errors.baseUrlInvalid")
        }
      } catch {
        errors.baseUrl = t("errors.baseUrlInvalid")
      }
    }

    if (!settings.model.trim()) {
      errors.model = t("errors.modelRequired")
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function saveSettings() {
    if (!validateSettings()) return

    setSaving(true)

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
    const payload = await readApiJson<PublicAiSettings>(response, t("errors.unexpectedResponse"))

    if (payload.ok) {
      setSettings(payload.data)
      setApiKey("")
      toastSuccess(t("messages.saved"))
    } else {
      toastApiError(payload, t("errors.unexpectedResponse"))
    }

    setSaving(false)
  }

  async function testConnection() {
    if (!validateSettings()) return

    setTesting(true)

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
    const payload = await readApiJson<{ model: string; sample?: string }>(response, t("errors.unexpectedResponse"))

    if (payload.ok) {
      toastSuccess(t("messages.verified", { model: payload.data.model }))
    } else {
      toastApiError(payload, t("errors.unexpectedResponse"))
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
        <div className="grid gap-2">
          <label htmlFor="ai-base-url" className="text-sm font-medium text-foreground">{t("fields.baseUrl")}</label>
          <input
            id="ai-base-url"
            value={settings.baseUrl}
            onChange={(event) => {
              setSettings((current) => ({ ...current, baseUrl: event.target.value }))
              handleClearFieldError("baseUrl")
            }}
            placeholder="https://api.openai.com/v1"
            aria-invalid={!!fieldErrors.baseUrl}
            aria-describedby={fieldErrors.baseUrl ? "ai-base-url-error" : undefined}
            className={`h-11 rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 ${
              fieldErrors.baseUrl ? "border-destructive" : "border-input"
            }`}
            disabled={loading || saving}
          />
          {fieldErrors.baseUrl ? (
            <p id="ai-base-url-error" className="text-xs text-destructive" role="alert">{fieldErrors.baseUrl}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="ai-model" className="text-sm font-medium text-foreground">{t("fields.model")}</label>
          <input
            id="ai-model"
            value={settings.model}
            onChange={(event) => {
              setSettings((current) => ({ ...current, model: event.target.value }))
              handleClearFieldError("model")
            }}
            placeholder="gpt-4o-mini"
            aria-invalid={!!fieldErrors.model}
            aria-describedby={fieldErrors.model ? "ai-model-error" : undefined}
            className={`h-11 rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 ${
              fieldErrors.model ? "border-destructive" : "border-input"
            }`}
            disabled={loading || saving}
          />
          {fieldErrors.model ? (
            <p id="ai-model-error" className="text-xs text-destructive" role="alert">{fieldErrors.model}</p>
          ) : null}
        </div>

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
