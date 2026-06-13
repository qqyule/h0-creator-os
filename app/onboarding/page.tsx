import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { AccountDnaForm } from "@/components/onboarding/account-dna-form"
import { BrandVoiceForm } from "@/components/onboarding/brand-voice-form"
import { Button } from "@/components/ui/button"
import type { AccountDna, BrandVoice } from "@/lib/domain"
import { ContentNotFoundError, getBrandVoice, getProfile } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function OnboardingPage() {
  const t = await getTranslations("onboarding")
  const workspace = await resolveWorkspace()
  let profile: AccountDna
  let brandVoice: BrandVoice | undefined
  try {
    ;[profile, brandVoice] = await Promise.all([
      getProfile(workspace.workspaceId),
      getBrandVoice(workspace.workspaceId),
    ])
  } catch (error) {
    if (error instanceof ContentNotFoundError && error.code === "PROFILE_NOT_FOUND") {
      profile = {
        workspaceId: workspace.workspaceId,
        niche: "",
        audience: "",
        platforms: [],
        cadence: "",
        tone: "",
        goals: [],
        updatedAt: new Date().toISOString(),
      }
      brandVoice = await getBrandVoice(workspace.workspaceId)
    } else {
      throw error
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <section className="border-b border-border pb-6 xl:col-span-2">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
        </section>

        <AccountDnaForm profile={profile} />
        <BrandVoiceForm brandVoice={brandVoice} />

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm xl:row-span-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">{t("demoSafe.title")}</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p>{t("demoSafe.demoWorkspace")}</p>
            <p>{t("demoSafe.dynamoFallback")}</p>
            <p>{t("demoSafe.userWorkspace")}</p>
          </div>
          <Button asChild className="mt-5 w-full" variant="outline">
            <Link href="/calendar">
              {t("continue")}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </aside>
      </div>
    </AppShell>
  )
}
