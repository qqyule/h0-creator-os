"use client"

import { useState, useTransition } from "react"
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AccountDna, PlatformId } from "@/lib/domain"

const platformOptions: { value: PlatformId; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
  { value: "rednote", label: "Rednote" },
]

export function AccountDnaForm({ profile }: { profile: AccountDna }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(profile.platforms)

  function togglePlatform(platform: PlatformId) {
    setSelectedPlatforms((current) =>
      current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform],
    )
  }

  function onSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const payload = {
        niche: String(formData.get("niche") ?? ""),
        audience: String(formData.get("audience") ?? ""),
        cadence: String(formData.get("cadence") ?? ""),
        tone: String(formData.get("tone") ?? ""),
        goals: String(formData.get("goals") ?? ""),
        platforms: selectedPlatforms,
      }

      if (!selectedPlatforms.length) {
        setMessage({ tone: "error", text: "Select at least one platform." })
        return
      }

      const response = await fetch("/api/v1/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as {
        ok: boolean
        data?: { warning?: string }
        error?: { message: string }
      }

      if (!result.ok) {
        setMessage({ tone: "error", text: result.error?.message ?? "Account DNA could not be saved." })
        return
      }

      setMessage({
        tone: "success",
        text: result.data?.warning ?? "Account DNA saved through the server boundary.",
      })
    })
  }

  return (
    <form action={onSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-foreground">Account DNA</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This context powers the monthly plan and platform rewrites.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Niche" name="niche" defaultValue={profile.niche} />
        <Field label="Audience" name="audience" defaultValue={profile.audience} />

        <div>
          <label className="text-sm font-medium text-foreground">Platforms</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {platformOptions.map((platform) => {
              const active = selectedPlatforms.includes(platform.value)
              return (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => togglePlatform(platform.value)}
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cadence" name="cadence" defaultValue={profile.cadence} />
          <Field label="Tone" name="tone" defaultValue={profile.tone} />
        </div>

        <div>
          <label htmlFor="goals" className="text-sm font-medium text-foreground">
            Goals
          </label>
          <textarea
            id="goals"
            name="goals"
            rows={5}
            defaultValue={profile.goals.join("\n")}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">One goal per line, or comma-separated.</p>
        </div>
      </div>

      {message ? (
        <div
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
        <Button type="submit" disabled={isPending || selectedPlatforms.length === 0} size="lg">
          {isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Save Account DNA
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue: string
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
      />
    </div>
  )
}
