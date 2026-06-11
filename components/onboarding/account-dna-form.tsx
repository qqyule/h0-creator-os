"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { AccountDna, PlatformId } from "@/lib/domain"

const platformOptions: { value: PlatformId; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
  { value: "rednote", label: "Rednote" },
]

/** 字段校验约束，与后端 accountDnaInputSchema 保持一致 */
const FIELD_CONSTRAINTS = {
  niche: { min: 2, max: 120 },
  audience: { min: 2, max: 240 },
  cadence: { min: 2, max: 120 },
  tone: { min: 2, max: 160 },
  goals: { min: 2, maxPerItem: 160, maxItems: 6 },
} as const

type FieldErrors = Partial<Record<"niche" | "audience" | "cadence" | "tone" | "goals" | "platforms", string>>

export function AccountDnaForm({ profile }: { profile: AccountDna }) {
  const t = useTranslations("accountDnaForm")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(profile.platforms)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleTogglePlatform = (platform: PlatformId) => {
    setSelectedPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    )
    // 选择平台后清除 platforms 错误
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.platforms
      return next
    })
  }

  /** 清除单个字段的错误（在用户输入时调用） */
  const handleClearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  /** 校验所有字段，返回是否通过 */
  const validateForm = (formData: FormData): boolean => {
    const errors: FieldErrors = {}

    // 校验文本字段：required + minLength + maxLength
    const textFields = ["niche", "audience", "cadence", "tone"] as const
    for (const field of textFields) {
      const value = String(formData.get(field) ?? "").trim()
      const constraint = FIELD_CONSTRAINTS[field]
      if (value.length < constraint.min) {
        errors[field] = t("errors.fieldRequired", { field: t(`fields.${field}`) })
      } else if (value.length > constraint.max) {
        errors[field] = t("errors.fieldMaxLength", { field: t(`fields.${field}`), max: constraint.max })
      }
    }

    // 校验平台
    if (selectedPlatforms.length === 0) {
      errors.platforms = t("errors.platformRequired")
    }

    // 校验 goals
    const goalsRaw = String(formData.get("goals") ?? "").trim()
    if (goalsRaw.length < FIELD_CONSTRAINTS.goals.min) {
      errors.goals = t("errors.goalsRequired")
    } else {
      const goalsList = goalsRaw
        .split(/\n|,/)
        .map((g) => g.trim())
        .filter(Boolean)
      if (goalsList.length === 0) {
        errors.goals = t("errors.goalsRequired")
      } else if (goalsList.length > FIELD_CONSTRAINTS.goals.maxItems) {
        errors.goals = t("errors.goalsMaxItems", { max: FIELD_CONSTRAINTS.goals.maxItems })
      } else {
        const tooLong = goalsList.some((g) => g.length > FIELD_CONSTRAINTS.goals.maxPerItem)
        if (tooLong) {
          errors.goals = t("errors.goalItemMaxLength", { max: FIELD_CONSTRAINTS.goals.maxPerItem })
        }
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setMessage(null)

    if (!validateForm(formData)) return

    startTransition(async () => {
      try {
        const payload = {
          niche: String(formData.get("niche") ?? ""),
          audience: String(formData.get("audience") ?? ""),
          cadence: String(formData.get("cadence") ?? ""),
          tone: String(formData.get("tone") ?? ""),
          goals: String(formData.get("goals") ?? ""),
          platforms: selectedPlatforms,
        }

        const profileResponse = await fetch("/api/v1/profile", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
        const profileResult = (await profileResponse.json()) as ApiResult<{ warning?: string }>

        if (!profileResult.ok) {
          setMessage({ tone: "error", text: profileResult.error?.message ?? t("errors.saveFailed") })
          return
        }

        setMessage({
          tone: "success",
          text: profileResult.data?.warning ?? t("messages.generatingPlan"),
        })

        const planResponse = await fetch("/api/v1/plans/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        })
        const planResult = (await planResponse.json()) as ApiResult<{
          saved?: { postCount: number }
          warning?: string
        }>

        if (!planResult.ok) {
          setMessage({ tone: "error", text: planResult.error?.message ?? t("errors.planFailed") })
          return
        }

        router.push("/calendar")
      } catch {
        setMessage({ tone: "error", text: t("errors.unexpected") })
      }
    })
  }


  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-sm" noValidate>
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="mt-5 grid gap-4">
        <Field
          label={t("fields.niche")}
          name="niche"
          defaultValue={profile.niche}
          required
          maxLength={FIELD_CONSTRAINTS.niche.max}
          error={fieldErrors.niche}
          onInput={() => handleClearFieldError("niche")}
        />
        <Field
          label={t("fields.audience")}
          name="audience"
          defaultValue={profile.audience}
          required
          maxLength={FIELD_CONSTRAINTS.audience.max}
          error={fieldErrors.audience}
          onInput={() => handleClearFieldError("audience")}
        />

        <fieldset>
          <legend className="text-sm font-medium text-foreground">{t("fields.platforms")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {platformOptions.map((platform) => {
              const active = selectedPlatforms.includes(platform.value)
              return (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => handleTogglePlatform(platform.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-accent"
                  }`}
                  aria-pressed={active}
                >
                  {platform.label}
                </button>
              )
            })}
          </div>
          {fieldErrors.platforms ? (
            <p className="mt-1.5 text-xs text-destructive" role="alert">{fieldErrors.platforms}</p>
          ) : null}
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t("fields.cadence")}
            name="cadence"
            defaultValue={profile.cadence}
            required
            maxLength={FIELD_CONSTRAINTS.cadence.max}
            error={fieldErrors.cadence}
            onInput={() => handleClearFieldError("cadence")}
          />
          <Field
            label={t("fields.tone")}
            name="tone"
            defaultValue={profile.tone}
            required
            maxLength={FIELD_CONSTRAINTS.tone.max}
            error={fieldErrors.tone}
            onInput={() => handleClearFieldError("tone")}
          />
        </div>

        <div>
          <label htmlFor="goals" className="text-sm font-medium text-foreground">
            {t("fields.goals")} <span className="text-destructive">*</span>
          </label>
          <textarea
            id="goals"
            name="goals"
            rows={5}
            defaultValue={profile.goals.join("\n")}
            aria-invalid={!!fieldErrors.goals}
            aria-describedby={fieldErrors.goals ? "goals-error" : "goals-hint"}
            onInput={() => handleClearFieldError("goals")}
            className={`mt-2 w-full rounded-xl border bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20 ${
              fieldErrors.goals ? "border-destructive" : "border-border"
            }`}
          />
          {fieldErrors.goals ? (
            <p id="goals-error" className="mt-1 text-xs text-destructive" role="alert">{fieldErrors.goals}</p>
          ) : (
            <p id="goals-hint" className="mt-1 text-xs text-muted-foreground">{t("goalsHint")}</p>
          )}
        </div>
      </div>

      {message ? (
        <div
          role={message.tone === "success" ? "status" : "alert"}
          className={`mt-5 flex items-start gap-2 rounded-xl border p-3 text-sm ${
            message.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
          <span>{message.text}</span>
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  )
}

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: { message: string }
}

function Field({
  label,
  name,
  defaultValue,
  required,
  maxLength,
  error,
  onInput,
}: {
  label: string
  name: string
  defaultValue: string
  required?: boolean
  maxLength?: number
  error?: string
  onInput?: () => void
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        onInput={onInput}
        className={`mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-destructive" role="alert">{error}</p>
      ) : null}
    </div>
  )
}
